export function parseDate(value) {
  if (!value) return null;
  const parts = value.split("/");
  if (parts.length !== 3) return null;
  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  console.log(d);
  return isNaN(d.getTime()) ? null : d;
}

export function dateSortComparator(v1, v2) {
  if (!v1) return -1;
  if (!v2) return 1;
  return v1.getTime() - v2.getTime();
}

export function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date)) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}
