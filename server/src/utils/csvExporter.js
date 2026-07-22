/**
 * Converts report summary data into CSV formatted string.
 */
export const generateMonthlyReportCSV = (month, data) => {
  const headers = [
    'Labourer Name',
    'Daily Wage (INR)',
    'Days Present',
    'Half Days',
    'Days Absent',
    'Total Earned (INR)',
    'Total Advances/Withdrawals (INR)',
    'Net Balance Owed (INR)',
  ];

  const rows = data.labourers.map((row) => [
    `"${(row.name || '').replace(/"/g, '""')}"`,
    row.dailyWage,
    row.daysPresent,
    row.halfDays,
    row.daysAbsent,
    row.totalEarned,
    row.totalWithdrawals,
    row.balance,
  ]);

  const csvLines = [
    `Shivam Enterprises - Monthly Ledger Report (${month})`,
    `Generated on: ${new Date().toISOString()}`,
    `Total Wages Earned: INR ${data.totalWagesEarned}`,
    `Total Advances Given: INR ${data.totalAdvancesGiven}`,
    ``,
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ];

  return csvLines.join('\n');
};
