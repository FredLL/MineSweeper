export const KEY_SEPARATOR = '\\';
const KEY_PREFIX = 'MINESWEEPER' + KEY_SEPARATOR;
const DEFAULT_MODE = '9*9/9';

export const localStorageAvailable = () => storageAvailable('localStorage');

const storageAvailable = (type: string):boolean => {
  var storage;
  try {
      storage = (window as any)[type];
      var x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
  }
  catch(e) {
      return e instanceof DOMException && (
          // everything except Firefox
          e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === 'QuotaExceededError' ||
          // Firefox
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
          // acknowledge QuotaExceededError only if there's something already stored
          (storage && storage.length !== 0);
  }
}

interface Result {
  colsRows: number;
  time: number;
}

export const getBestResult = (mode=DEFAULT_MODE) => {
  let bestTime = -1;
  let bestMode = -1;
  let desc = 'Nobody yet';
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(KEY_PREFIX)) {
      const parts = key.split(KEY_SEPARATOR);
      if (mode == parts[2]) {
        try {
          const result = JSON.parse(localStorage.getItem(localStorage.key(i)));
          if (result.colsRows > bestMode) {
            bestMode = result.colsRows;
            if (bestTime == -1 || result.time < bestTime) {
              bestTime = result.time;
              desc = '' + bestTime + ' secs by ' + parts[1];
            }
          }
        } catch (e) {}
      }
    }
  }
  return desc;
}

export const saveResult = (time: number, mode = DEFAULT_MODE, name = 'nobody') => {
  localStorage.setItem(KEY_PREFIX + name + KEY_SEPARATOR + mode + KEY_SEPARATOR + Date.now(), JSON.stringify({colsRows: eval(mode) as number, time: time} as Result));
}

export interface ListElt {
  nom: string,
  mode: string,
  date: string,
  time: number
}

export const listResults = (name=''):Array<ListElt> => {
  const res:ListElt[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(KEY_PREFIX)) {
      const parts = key.split(KEY_SEPARATOR);
      if (!name || parts[1].indexOf(name) > -1) {
        const result = JSON.parse(localStorage.getItem(localStorage.key(i))) as Result;
        res.push({nom: parts[1], mode: parts[2], date: new Date(parseInt(parts[3])).toLocaleString(), time: result.time});
      }
    }
  }
  return res.sort((a, b) => a.time - b.time);
}
