import moment from 'moment-timezone';

export function datetimeISO(date: Date | string): string {
  return moment(date).toISOString();
}

export function dateFormat(date: Date | string, format = 'YYYY-MM-DD'): string {
  return moment(date).format(format);
}

export function localDateFormat(
  date: Date | string,
  format = 'YYYY-MM-DD',
): string {
  return moment(date).local().format(format);
}
export function localDateTimeFormat(
  date: Date | string,
  format = 'YYYY-MM-DD HH:mm:ss',
): string {
  return moment(date).local().format(format);
}

export function daysFrom(date: Date | string | null | undefined): number {
  if (!date) {
    return 0;
  }
  return moment().diff(moment(date), 'days');
}
