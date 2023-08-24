export function throttle(func, delay) {
  let timer;
  return function(...args) {
    if (!timer) {
      func.apply(this, args);
      timer = setTimeout(() => {
        timer = null;
      }, delay);
    }
  };
}
