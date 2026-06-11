import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import * as XLSX from 'xlsx';

// Types for reconciliation
interface Transaction {
  id: string;
  date: string; // Use string for serialization
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
    const bankFile = formData.get('bankStatement') as File;
    const ledgerFile = formData.get('ledgerSheet') as File;

    if (!bankFile || !ledgerFile) {
      return NextResponse.json({ error: 'Missing files' }, { status: 400 });
    }

    // 1. Parse PDF (Bank Statement)
    const bankBuffer = Buffer.from(await bankFile.arrayBuffer());
    // @ts-ignore - pdf-parse has incompatible types for Buffer in some environments
    const bankData = await pdf(bankBuffer);
    const bankTransactions = parseThaiBankPDF(bankData.text);

    // 2. Parse Excel (Ledger)
    const ledgerBuffer = Buffer.from(await ledgerFile.arrayBuffer());
    const workbook = XLSX.read(ledgerBuffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const ledgerRows = XLSX.utils.sheet_to_json(worksheet) as any[];
    const ledgerTransactions = parseLedgerExcel(ledgerRows);

    // 3. Reconcile
    const result = reconcile(bankTransactions, ledgerTransactions);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Reconciliation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function parseThaiBankPDF(text: string): Transaction[] {
  const transactions: Transaction[] = [];
  const lines = text.split('\n');
  
  lines.forEach((line, index) => {
    const dateMatch = line.match(/(\d{2})[\/.-](\d{2})[\/.-](\d{2,4})/);
    const amountMatch = line.match(/(\d{1,3}(,\d{3})*(\.\d{2}))/);

    if (dateMatch && amountMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1;
      let year = parseInt(dateMatch[3]);
      if (year < 100) year += 2000;
      if (year > 2500) year -= 543; // Handle Buddhist Era

      const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      
      transactions.push({
        id: `bank-${index}`,
        date: new Date(year, month, day).toISOString(),
        amount,
        description: line.substring(0, 50).trim(),
        source: 'bank'
      });
    }
  });

  return transactions;
}

function parseLedgerExcel(rows: any[]): Transaction[] {
  return rows.map((row, index) => {
    const dateKey = Object.keys(row).find(k => k.toLowerCase().includes('date')) || 'Date';
    const amountKey = Object.keys(row).find(k => k.toLowerCase().includes('amount')) || 'Amount';
    const descKey = Object.keys(row).find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('ref')) || 'Description';

    let dateValue = row[dateKey];
    let finalDate: Date;

    if (typeof dateValue === 'number') {
       finalDate = new Date((dateValue - 25569) * 86400 * 1000);
    } else {
       finalDate = new Date(dateValue);
    }

    return {
      id: `ledger-${index}`,
      date: isNaN(finalDate.getTime()) ? new Date().toISOString() : finalDate.toISOString(),
      amount: parseFloat(String(row[amountKey] || 0).replace(/,/g, '')),
      description: String(row[descKey] || ''),
      source: 'ledger'
    };
  }).filter(t => !isNaN(t.amount) && t.amount !== 0);
}

function reconcile(bank: Transaction[], ledger: Transaction[]): ReconciliationResult {
  const matches: Array<{ bank: Transaction; ledger: Transaction }> = [];
  const unmatchedBank = [...bank];
  const unmatchedLedger = [...ledger];

  for (let i = unmatchedBank.length - 1; i >= 0; i--) {
    const bTx = unmatchedBank[i];
    const bDate = new Date(bTx.date).getTime();
    
    let bestMatchIndex = -1;
    let minTimeDiff = Infinity;

    for (let j = 0; j < unmatchedLedger.length; j++) {
      const lTx = unmatchedLedger[j];
      
      if (Math.abs(bTx.amount - lTx.amount) < 0.01) {
        const lDate = new Date(lTx.date).getTime();
        const timeDiff = Math.abs(bDate - lDate);
        if (timeDiff < 3 * 24 * 60 * 60 * 1000 && timeDiff < minTimeDiff) {
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
