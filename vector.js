import Line from './line.js';
import Point from './point.js';
export class Vector {
  constructor(x, y, originalStart) {
    this.x = x;
    this.y = y;
    this.originalStart = originalStart;
  }

  static fromLine(line) {
    return new Vector(
      line.end.x - line.start.x,
      line.end.y - line.start.y,
      line.start
    );
  }

  slope() {
    // Luckily we don't need to worry about divide-by-zero since javascript will return +Infinity or -Infinity accordingly
    return this.y / this.x;
  }

  toLine() {
    if (this.originalStart == null) {
      throw new Error(
        'Cannot convert a vector to a line without the original location'
      );
    }
    return new Line(
      this.originalStart,
      new Point(this.originalStart.x + this.x, this.originalStart.y + this.y)
    );
  }

  crossProduct(other) {
    return this.x * other.y - this.y * other.x;
  }

  dotProduct(other) {
    return this.x * other.x + this.y * other.y;
  }
}
