export default class Point {
  constructor(x, y) {
    if (![x, y].every((num) => typeof num === 'number' && isFinite(num))) {
      throw new Error(`Cannot create a point from ${x},${y}`);
    }
    this.x = x;
    this.y = y;
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }
}
