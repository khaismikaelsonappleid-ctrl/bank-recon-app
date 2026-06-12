import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import * as XLSX from 'xlsx';

interface Transaction {
  id: string;
  date: string; 
  amount: number;
  description: string;
  source: 'bank' | 'ledger';
}

interface ReconciliationResult {
  matches: Array<{ bank: Transaction; ledger: Transaction }>;
  unmatchedBank: Transaction[];
  unmatchedLedger: Transaction[];
  stats: {
    totalBank: number;
    totalLedger: number;
    matchCount: number;
    matchRate: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const bankFiles = formData.getAll('bankStatements') as File[];
    const ledgerFiles = formData.getAll('ledgerSheets') as File[];

    if (bankFiles.length === 0 && ledgerFiles.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const bankTransactions: Transaction[] = [];
    const ledgerTransactions: Transaction[] = [];

    for (const file of bankFiles) {
      if (file.size === 0) continue;
      const buffer = Buffer.from(await file.arrayBuffer());
      // @ts-ignore
      const data = await pdf(buffer);
      bankTransactions.push(...parseThaiBankPDF(data.text, file.name));
    }

    for (const file of ledgerFiles) {
      if (file.size === 0) continue;
      const buffer = Buffer.from(await file.arrayBuffer());
      const workbook = XLSX.read(buffer);
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet) as any[];
        ledgerTransactions.push(...parseLedgerExcel(rows, file.name));
      }
    }

    const result = reconcile(bankTransactions, ledgerTransactions);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Reconciliation error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

function parseDate(dateStr: any): Date | null {
  if (typeof dateStr === 'number') return new Date((dateStr - 25569) * 86400 * 1000);
  if (typeof dateStr !== 'string') return null;
  const parts = dateStr.split(/[/.-]/);
  if (parts.length < 3) return null;
  
  let day = parseInt(parts[0]);
  let month = parseInt(parts[1]) - 1;
  let year = parseInt(parts[2]);

  // Handle Buddhist Era to Gregorian
  if (year >= 2400) {
    year -= 543;
  } else if (year < 100) {
    year += (year < 50 ? 2000 : 1900);
  }

  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? null : d;
}

function parseThaiBankPDF(text: string, fileName: string): Transaction[] {
  const transactions: Transaction[] = [];
  text.split('\n').forEach((line, index) => {
    // Look for DD/MM/YY or DD/MM/YYYY
    const dateMatch = line.match(/(\d{2})[\/.-](\d{2})[\/.-](\d{2,4})/);
    const amountMatch = line.match(/(\d{1,3}(,\d{3})*(\.\d{2}))/);

    if (dateMatch && amountMatch) {
      const d = parseDate(dateMatch[0]);
      if (d) {
        transactions.push({
          id: `bank-${fileName}-${index}`,
          date: d.toISOString(),
          amount: parseFloat(amountMatch[1].replace(/,/g, '')),
          description: line.substring(0, 50).trim(),
          source: 'bank'
        });
      }
    }
  });
  return transactions;
}

function parseLedgerExcel(rows: any[], fileName: string): Transaction[] {
  return rows.map((row, index) => {
    const dateKey = Object.keys(row).find(k => k.toLowerCase().includes('date')) || 'Date';
    const amountKey = Object.keys(row).find(k => k.toLowerCase().includes('amount')) || 'Amount';
    const descKey = Object.keys(row).find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('ref')) || 'Description';

    const d = parseDate(row[dateKey]);
    return {
      id: `ledger-${fileName}-${index}`,
      date: (d || new Date()).toISOString(),
      amount: parseFloat(String(row[amountKey] || 0).replace(/,/g, '')),
      description: String(row[descKey] || ''),
      source: 'ledger' as const
    };
  }).filter(t => !isNaN(t.amount) && t.amount !== 0);
}

function reconcile(bank: Transaction[], ledger: Transaction[]): ReconciliationResult {
  const matches: Array<{ bank: Transaction; ledger: Transaction }> = [];
  const unmatchedBank = [...bank];
  const unmatchedLedger = [...ledger];

  for (let i = unmatchedBank.length - 1; i >= 0; i--) {
    const bTx = unmatchedBank[i];
    let bestMatchIndex = -1;
    let minTimeDiff = Infinity;

    for (let j = 0; j < unmatchedLedger.length; j++) {
      const lTx = unmatchedLedger[j];
      const amountDiff = Math.abs(bTx.amount - lTx.amount);
      const timeDiff = Math.abs(new Date(bTx.date).getTime() - new Date(lTx.date).getTime());

      if (amountDiff < 0.01 && timeDiff < 3 * 24 * 60 * 60 * 1000) {
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          bestMatchIndex = j;
        }
      }
    }

    if (bestMatchIndex !== -1) {
      matches.push({ bank: bTx, ledger: unmatchedLedger[bestMatchIndex] });
      unmatchedBank.splice(i, 1);
      unmatchedLedger.splice(bestMatchIndex, 1);
    }
  }

  return {
    matches,
    unmatchedBank,
    unmatchedLedger,
    stats: {
      totalBank: bank.length,
      totalLedger: ledger.length,
      matchCount: matches.length,
      matchRate: bank.length > 0 ? (matches.length / bank.length) * 100 : 0
    }
  };
}