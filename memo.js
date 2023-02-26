export default class Memo {
  constructor() {
    this.cache = new Map();
  }

  memo(key, impl) {
    if (!this.cache.has(key)) {
      this.cache.set(key, impl());
    }
    return this.cache.get(key);
  }
}
