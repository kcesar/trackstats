export default class Line {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  distance() {
    return Math.sqrt(
      (this.end.x - this.start.x) ** 2 + (this.end.y - this.start.y) ** 2
    );
  }
}
