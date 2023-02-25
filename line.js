export default class Line {
  constructor([x1, y1], [x2, y2]) {
    this.start = [x1, y1];
    this.end = [x2, y2];
  }

  distance() {
    if (
      ![...this.start, ...this.end].every(
        (num) => typeof num === 'number' && isFinite(num)
      )
    ) {
      throw new Error(
        `Cannot calculate the distance between ${this.start} and ${this.end}`
      );
    }
    const [x1, y1] = this.start;
    const [x2, y2] = this.end;
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
}
