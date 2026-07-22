/**
 * CSV Export utility for monthly attendance & wage reports
 */

export interface ReportRow {
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

export const exportMonthlyReportToCSV = (
  month: string,
  rows: ReportRow[],
  filename = `Shivam_Enterprises_Report_${month}.csv`
) => {
  const headers = [
    'Labourer Name',
    'Daily Wage (₹)',
    'Days Present',
    'Half Days',
    'Days Absent',
    'Total Earned (₹)',
    'Total Advances (₹)',
    'Net Balance Owed (₹)',
  ];

  const csvRows = [
    [`Shivam Enterprises - Monthly Labour Ledger Report (${month})`],
    [`Generated on: ${new Date().toLocaleString('en-IN')}`],
    [],
    headers,
    ...rows.map((row) => [
      `"${row.name.replace(/"/g, '""')}"`,
      row.dailyWage,
      row.daysPresent,
      row.halfDays,
      row.daysAbsent,
      row.totalEarned,
      row.totalAdvances,
      row.netBalanceOwed,
    ]),
    [],
    [
      'TOTALS',
      '',
      rows.reduce((acc, r) => acc + r.daysPresent, 0),
      rows.reduce((acc, r) => acc + r.halfDays, 0),
      rows.reduce((acc, r) => acc + r.daysAbsent, 0),
      rows.reduce((acc, r) => acc + r.totalEarned, 0),
      rows.reduce((acc, r) => acc + r.totalAdvances, 0),
      rows.reduce((acc, r) => acc + r.netBalanceOwed, 0),
    ],
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
