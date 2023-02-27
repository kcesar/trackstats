export default class Memo {
  cache: Map<string, any>;
  constructor() {
    this.cache = new Map();
  }

  memo(key: string, impl: () => any) {
    if (!this.cache.has(key)) {
      this.cache.set(key, impl());
    }
    return this.cache.get(key);
  }
}
