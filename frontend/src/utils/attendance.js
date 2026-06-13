/**
 * Get color class and status label based on attendance percentage
 */
export const getAttendanceStatus = (pct) => {
  if (pct >= 80) return { label: 'SAFE', color: 'emerald', hex: '#10B981', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
  if (pct >= 75) return { label: 'WARNING', color: 'amber', hex: '#F59E0B', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
  return { label: 'CRITICAL', color: 'red', hex: '#EF4444', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
};

/**
 * Calculate how many lectures can be safely missed
 */
export const calcSafeBunks = (attended, total, required = 75) => {
  const reqFraction = required / 100;
  return Math.max(0, Math.floor(attended - reqFraction * total));
};

/**
 * Calculate lectures needed to reach required %
 */
export const calcLecturesNeeded = (attended, total, required = 75) => {
  const reqFraction = required / 100;
  const needed = (reqFraction * total - attended) / (1 - reqFraction);
  return Math.max(0, Math.ceil(needed));
};

/**
 * Format percentage with 1 decimal place
 */
export const formatPct = (n) => `${parseFloat(n).toFixed(1)}%`;

/**
 * Export attendance data as CSV
 */
export const exportCSV = (subjects, userName) => {
  const headers = ['Subject', 'Attended', 'Total', 'Percentage', 'Status'];
  const rows = subjects.map(s => {
    const status = getAttendanceStatus(s.attendancePercentage);
    return [s.subjectName, s.attendedClasses, s.totalClasses, `${s.attendancePercentage}%`, status.label];
  });

  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendwise_${userName}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
