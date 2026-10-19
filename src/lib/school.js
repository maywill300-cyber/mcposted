// School-specific rules: who can join, school-year math, lunch timing.

export const SCHOOL_DOMAIN = 'mccallie.org';
const TZ = 'America/New_York';

// Date and time parts in Eastern time.
export function easternParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
    weekday: get('weekday'),
  };
}

// The graduating class this school year. Switches over in July.
export function currentSeniorYear(date = new Date()) {
  const { year, month } = easternParts(date);
  return month >= 7 ? year + 1 : year;
}

export function gradYearFromEmail(email) {
  const m = /([0-9]{2})@mccallie\.org$/i.exec(String(email || '').trim());
  return m ? 2000 + Number(m[1]) : null;
}

// Checks an email before sending a login code. The database checks again on sign-up.
export function checkSchoolEmail(raw) {
  const email = String(raw || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Enter your full school email address.' };
  }
  if (!email.endsWith('@' + SCHOOL_DOMAIN)) {
    return { ok: false, error: 'Use your school email address.' };
  }
  const gradYear = gradYearFromEmail(email);
  const senior = currentSeniorYear();
  if (!gradYear) {
    return { ok: false, error: "We couldn't read a graduation year in that email." };
  }
  if (gradYear < senior || gradYear > senior + 3) {
    return { ok: false, error: 'McPosted is only open to current high school students.' };
  }
  return { ok: true, email, gradYear };
}

export function isGraduated(gradYear) {
  return gradYear < currentSeniorYear();
}

export function classLabel(gradYear) {
  return "Class of '" + String(gradYear).slice(-2);
}

const pad = (n) => String(n).padStart(2, '0');

// Today's date in Eastern time, as YYYY-MM-DD.
export function todayEastern(date = new Date()) {
  const { year, month, day } = easternParts(date);
  return `${year}-${pad(month)}-${pad(day)}`;
}

// Monday of the current school week, as YYYY-MM-DD.
export function mondayEastern(date = new Date()) {
  const { year, month, day, weekday } = easternParts(date);
  const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const offset = order.indexOf(weekday);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() - offset);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

// Lunch ratings open after lunch on school days, so nobody is on their phone in
// the dining hall (Blue Book p. 20).
export function lunchOpenTime() {
  const raw = process.env.LUNCH_RATINGS_OPEN_AT || '13:40';
  const [h, m] = raw.split(':').map(Number);
  return { hour: h || 13, minute: m || 0, label: formatClock(h || 13, m || 0) };
}

export function lunchRatingsOpen(date = new Date()) {
  const { hour, minute, weekday } = easternParts(date);
  if (weekday === 'Sat' || weekday === 'Sun') return false;
  const open = lunchOpenTime();
  return hour * 60 + minute >= open.hour * 60 + open.minute;
}

function formatClock(h, m) {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad(m)} ${suffix}`;
}
