import { formatInTimeZone } from 'date-fns-tz';

const IST = 'Asia/Kolkata';

export function formatIST(
  date: Date | string,
  pattern = 'dd MMM yyyy, hh:mm a'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatInTimeZone(d, IST, pattern);
}

export function utcNow(): Date {
  return new Date();
}
