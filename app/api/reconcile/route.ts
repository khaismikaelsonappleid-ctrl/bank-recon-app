import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import * as XLSX from 'xlsx';

// Types for reconciliation
interface Transaction {
  id: string;
  date: Date;
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
  // Basic regex for common Thai Bank layouts (KBank, SCB)
  // Look for patterns like: DD/MM/YY or DD MMM YYYY and amounts
  // Note: Thai banks often use Buddhist Era (BE) or standard AD.
  const lines = text.split('\n');
  
  lines.forEach((line, index) => {
    // Example pattern: 11/06/2026 14:30 1,500.00
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
        date: new Date(year, month, day),
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
    // Try to find Date and Amount columns dynamically
    const dateKey = Object.keys(row).find(k => k.toLowerCase().includes('date')) || 'Date';
    const amountKey = Object.keys(row).find(k => k.toLowerCase().includes('amount')) || 'Amount';
    const descKey = Object.keys(row).find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('ref')) || 'Description';

    let dateValue = row[dateKey];
    // Handle Excel serial dates
    if (typeof dateValue === 'number') {
       const date = new Date((dateValue - 25569) * 86400 * 1000);
       dateValue = date;
    } else {
       dateValue = new Date(dateValue);
    }

    return {
      id: `ledger-${index}`,
      date: dateValue,
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

  // Match logic: Same amount, nearest date (within 3 days)
  for (let i = unmatchedBank.length - 1; i >= 0; i--) {
    const bTx = unmatchedBank[i];
    
    let bestMatchIndex = -1;
    let minTimeDiff = Infinity;

    for (let j = 0; j < unmatchedLedger.length; j++) {
      const lTx = unmatchedLedger[j];
      
      if (Math.abs(bTx.amount - lTx.amount) < 0.01) {
        const timeDiff = Math.abs(bTx.date.getTime() - lTx.date.getTime());
        // Limit to 3 days window
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
