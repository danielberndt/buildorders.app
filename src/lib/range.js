export const createArrayWith = (n, cb) => {
  if (Array.from) {
    return Array.from({length: n}, (_, i) => cb(i));
  } else {
    return Array(n)
      .fill()
      .map((_, i) => cb(i));
  }
};
