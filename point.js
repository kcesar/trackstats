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

  static fromUtm({ easting, northing, zoneLetter }, requiredZone) {
    if (zoneLetter !== requiredZone) {
      throw new Error(
        `Found point in UTM zone ${zoneLetter}, instead of ${requiredZone}`
      );
    }
    return new Point(Math.round(easting), Math.round(northing));
  }
}
