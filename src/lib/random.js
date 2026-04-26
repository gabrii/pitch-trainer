export function pickRandomMidi(lo, hi, exclude) {
  const range = hi - lo + 1;
  if (range <= 1) return lo;
  let next;
  do {
    next = lo + Math.floor(Math.random() * range);
  } while (next === exclude && range > 1);
  return next;
}
