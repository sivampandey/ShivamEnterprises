import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatMonthDisplay, formatDateDisplay } from './formatters';
import { Labourer, LedgerEntry } from '../api/types';

export interface MonthlyReportRow {
  labourerId: string;
  name: string;
  dailyWage: number;
  daysPresent: number;
  halfDays: number;
  daysAbsent: number;
  totalEarned: number;
  totalAdvances: number;
  netBalanceOwed: number;
}

/**
 * Clean & Simple PDF Exporter for Shivam Enterprises Monthly Report
 */
export const exportMonthlyReportPDF = (
  month: string,
  summary: {
    totalWagesPaid: number;
    totalAdvancesGiven: number;
    netBalanceOutstanding: number;
  },
  rows: MonthlyReportRow[]
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Colors
  const brassColor: [number, number, number] = [185, 129, 46]; // #B9812E
  const inkColor: [number, number, number] = [38, 34, 26];     // #26221A
  const grayColor: [number, number, number] = [100, 100, 100];

  // Header Banner
  doc.setFillColor(...brassColor);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SHIVAM ENTERPRISES', 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Labour Attendance & Wage Ledger Report', 14, 18);

  doc.text(`Month: ${formatMonthDisplay(month)}`, 196, 12, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 196, 18, { align: 'right' });

  // Summary Metrics Section Box
  doc.setDrawColor(230, 222, 200);
  doc.setFillColor(250, 246, 236);
  doc.roundedRect(14, 30, 182, 20, 2, 2, 'FD');

  doc.setTextColor(...inkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  // Metric 1
  doc.text('TOTAL WAGES EARNED', 20, 37);
  doc.setFontSize(12);
  doc.text(formatCurrency(summary.totalWagesPaid), 20, 44);

  // Metric 2
  doc.setFontSize(9);
  doc.text('ADVANCES ISSUED', 85, 37);
  doc.setFontSize(12);
  doc.text(formatCurrency(summary.totalAdvancesGiven), 85, 44);

  // Metric 3
  doc.setFontSize(9);
  doc.text('NET BALANCE OWED', 150, 37);
  doc.setFontSize(12);
  doc.setTextColor(47, 72, 88); // Navy
  doc.text(formatCurrency(summary.netBalanceOutstanding), 150, 44);

  // Detailed Workers Table
  const tableHeaders = [
    [
      'Labourer Name',
      'Daily Wage',
      'Present',
      'Half Days',
      'Absent',
      'Earned',
      'Advances',
      'Balance Owed',
    ],
  ];

  const tableBody = rows.map((r) => [
    r.name,
    formatCurrency(r.dailyWage),
    r.daysPresent.toString(),
    r.halfDays.toString(),
    r.daysAbsent.toString(),
    formatCurrency(r.totalEarned),
    formatCurrency(r.totalAdvances),
    formatCurrency(r.netBalanceOwed),
  ]);

  // Totals Row
  const totalEarned = rows.reduce((acc, r) => acc + r.totalEarned, 0);
  const totalAdvances = rows.reduce((acc, r) => acc + r.totalAdvances, 0);
  const totalBalance = rows.reduce((acc, r) => acc + r.netBalanceOwed, 0);

  tableBody.push([
    'TOTALS',
    '',
    rows.reduce((acc, r) => acc + r.daysPresent, 0).toString(),
    rows.reduce((acc, r) => acc + r.halfDays, 0).toString(),
    rows.reduce((acc, r) => acc + r.daysAbsent, 0).toString(),
    formatCurrency(totalEarned),
    formatCurrency(totalAdvances),
    formatCurrency(totalBalance),
  ]);

  autoTable(doc, {
    startY: 56,
    head: tableHeaders,
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: brassColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: inkColor,
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left' },
      1: { halign: 'right' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right', fontStyle: 'bold', textColor: [47, 72, 88] },
    },
    alternateRowStyles: {
      fillColor: [252, 250, 245],
    },
    margin: { left: 14, right: 14 },
  });

  // Footer Signature Section
  const finalY = (doc as any).lastAutoTable.finalY || 180;
  if (finalY < 250) {
    doc.setDrawColor(180, 180, 180);
    doc.line(140, finalY + 25, 195, finalY + 25);

    doc.setFontSize(8.5);
    doc.setTextColor(...grayColor);
    doc.text('Authorized Shop Admin Signature', 140, finalY + 29);
    doc.text('Shivam Enterprises', 140, finalY + 33);
  }

  // Save PDF File
  doc.save(`Shivam_Enterprises_Report_${month}.pdf`);
};

/**
 * Individual Labourer Ledger PDF Statement Exporter
 */
export const exportLabourerLedgerPDF = (
  labourer: Labourer,
  stats: {
    daysPresent: number;
    halfDays: number;
    daysAbsent: number;
    totalEarned: number;
    totalAdvances: number;
    totalSettled: number;
    balanceOwed: number;
  },
  entries: LedgerEntry[]
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const brassColor: [number, number, number] = [185, 129, 46];
  const inkColor: [number, number, number] = [38, 34, 26];

  // Header Banner
  doc.setFillColor(...brassColor);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SHIVAM ENTERPRISES', 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Worker Ledger Statement', 14, 18);

  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 196, 15, { align: 'right' });

  // Worker Info Card
  doc.setDrawColor(230, 222, 200);
  doc.setFillColor(250, 246, 236);
  doc.roundedRect(14, 30, 182, 24, 2, 2, 'FD');

  doc.setTextColor(...inkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(labourer.name, 20, 39);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Daily Wage Rate: ${formatCurrency(labourer.dailyWage)}   |   Joined: ${formatDateDisplay(labourer.createdAt)}`, 20, 47);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('NET BALANCE OWED:', 130, 39);
  doc.setFontSize(14);
  doc.setTextColor(47, 72, 88);
  doc.text(formatCurrency(stats.balanceOwed), 130, 48);

  // Table Timeline
  const headers = [['Date', 'Entry Type / Status', 'Earned', 'Advance', 'Paid / Settled', 'Running Balance']];
  const body = entries.map((e) => [
    formatDateDisplay(e.date),
    e.type === 'SETTLEMENT' ? 'SETTLEMENT PAYMENT' : (e.status || 'ATTENDANCE'),
    e.earnedAmount > 0 ? formatCurrency(e.earnedAmount) : '—',
    e.advanceTaken > 0 ? formatCurrency(e.advanceTaken) : '—',
    e.amountPaid && e.amountPaid > 0 ? formatCurrency(e.amountPaid) : '—',
    formatCurrency(e.runningBalance),
  ]);

  autoTable(doc, {
    startY: 60,
    head: headers,
    body: body,
    theme: 'grid',
    headStyles: {
      fillColor: brassColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: inkColor,
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'center', fontStyle: 'bold' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold', textColor: [47, 72, 88] },
    },
    alternateRowStyles: {
      fillColor: [252, 250, 245],
    },
    margin: { left: 14, right: 14 },
  });

  const safeName = labourer.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Shivam_Ledger_${safeName}.pdf`);
};
