/** Set when the team enters `122` on `/vulin`; required to open `/122` success screen. */
export const VULIN_SOLVED_KEY = 'ge-vulin-solved';

export function readVulinSolved(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(VULIN_SOLVED_KEY) === '1';
  } catch {
    return false;
  }
}

export function setVulinSolved(on: boolean) {
  try {
    if (on) sessionStorage.setItem(VULIN_SOLVED_KEY, '1');
    else sessionStorage.removeItem(VULIN_SOLVED_KEY);
  } catch {
    /* ignore */
  }
}
