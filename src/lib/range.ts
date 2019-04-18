export const createArrayWith = <T>(n: number, cb: (idx: number) => T) => {
  if (Array.from) {
    return Array.from({length: n}, (_, i) => cb(i));
  } else {
    return Array(n)
      .fill(undefined)
      .map((_, i) => cb(i));
  }
};
