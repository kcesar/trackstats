import { fromLatLon } from 'utm';
import Line from './line.js';
import Memo from './memo.js';
import Point from './point.js';
export default class Polygon {
  constructor({ id, geometry: { coordinates }, properties: { title } }) {
    this.id = id;
    this.title = title;
    this.longLat = coordinates[0];
    this.utmZone = null;
    this.cache = new Memo();
  }

  static fromCartesian({ id, title, points, utmZone }) {
    const polygon = new Polygon({
      id,
      geometry: { coordinates: [] },
      properties: { title },
    });
    polygon.utmZone = utmZone;
    polygon.cache.memo('points', () => {
      points = [...points];
      if (points.length > 0) {
        const first = points[0];
        const last = points[points.length - 1];
        if (!first.equals(last)) {
          // Close the polygon by adding a line from the last coordinate to the first coordinate
          points.push(first);
        }
        return points;
      }
    });
    return polygon;
  }

  points() {
    return this.cache.memo('points', () => {
      const utm = this.longLat.map(([long, lat]) => fromLatLon(lat, long));
      this.utmZone = utm[0]?.zoneLetter;
      const points = utm.map((data) => Point.fromUtm(data, this.utmZone));
      if (points.length > 0) {
        const first = points[0];
        const last = points[points.length - 1];
        if (!first.equals(last)) {
          // Close the polygon by adding a line from the last coordinate to the first coordinate
          points.push(first);
        }
      }
      return points;
    });
  }

  lines() {
    return this.cache.memo('lines', () => {
      const starts = this.points().slice(0, -1);
      const ends = this.points().slice(1);
      return (
        starts
          .map((start, i) => new Line(start, ends[i]))
          // remove lines which are points
          .filter((line) => !line.start.equals(line.end))
        // todo remove points which don't change the slope
      );
    });
  }

  isConvex() {
    // Implemented based on https://stackoverflow.com/a/1881201 algorithm
    return this.cache.memo('isConvex', () => {
      const lines = this.lines();
      if (lines.length < 3) {
        return false;
      }

      let requiredCardinality = null;
      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        // The algorithm works by comparing two adjacent lines at a time. The very last comparison
        // needs to take the last line & the first line
        const nextLine = lines[i + 1] ?? lines[0];

        // First, calculate the delta x & delta y for both lines
        const lineChangeX = line.end.x - line.start.x;
        const lineChangeY = line.end.y - line.start.y;
        const nextLineChangeX = nextLine.end.x - nextLine.start.x;
        const nextLineChangeY = nextLine.end.y - nextLine.start.y;

        // Now, calculate the matrix cross-product of these two lines:
        const cross =
          lineChangeX * nextLineChangeY - lineChangeY * nextLineChangeX;
        const cardinality = cross > 0;

        // Convex polxygons all have the same z-product cardinality (e.g all positive cross products or all negative)
        // If any one is the other sign, then return false
        // Ignore parallel edges (consider them still convex)
        requiredCardinality = requiredCardinality ?? cardinality;
        if (cardinality != requiredCardinality) {
          return false;
        }
      }
      return true;
    });
  }

  normalLines() {
    // For each line in the array, returns a new array where each line begins at the same point
    // but is rotated 90 degrees to be perpendicular
    // The direction of rotation is chosen such that the new line always points away from the center
    // of the polygon.
    // (This is also referred to as the outer normal vector for a given vector)
    return this.cache.memo('normals', () => {
      const lines = this.lines();
      if (lines.length < 3) {
        throw new Error('Cannot calculate the normals when not a polygon');
      }

      if (!this.isConvex()) {
        throw new Error('Cannot calculate the normals of a concave polygon');
      }
      const normals = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // The algorithm works by comparing two adjacent lines at a time. The very last comparison
        // needs to take the last line & the first line
        const nextLine = lines[i + 1] ?? lines[0];

        // Calculating the rotation can be done with matrix math:
        // https://en.wikipedia.org/wiki/Rotation_matrix
        // So given the rotation matrix of
        // [cos 90, -sin90
        // sin 90, cos 90]
        // doing the matrix multiplication gives the formula
        // x' = end.x cos 90 - end.y sin 90
        // y' = end.x sin 90 - end.y cos 90
        // Since sin(90) = 1, and cos(90) = 0, this simplifies to
        // x' = -end.y
        // and y' = end.x
        // Meaning that for a vector (e.g. starting at 0,0 and going to end.x,end.y)
        // the perpendicular vector starts at 0,0 and goes to (-y, x)

        // Alternatively, instead of rotating 90 degrees, we could have rotated 270 degrees
        // sin(270) = -1, and cos(270) = 0, so the final formula would be
        // x' = end.y
        // y' = -end.x

        // Now that we have these two normalized vectors, we need to figure out which one to use
        // The inner product calculates the angle between two vectors. We can use the sign of this angle to tell if it's inside or outside
        // However, the inner product of two vectors at a 90 degree angle is 0, so we can't just compare the normal to the original line
        // But! It's a polygon so we have more than just one line. Given the points A-->B-->C
        // Then A-->B is the current line and A-->C is the next line
        // To make the math easier, we want to continue to use point A as the center of our universe,
        // so we can create a new line from A----->C directly (skipping B), and this line must be closer to the center of the polygon
        // because the polygon is convex (unless the slope is the same). However we have ensured that this is not the case
        // when generating the lines.

        // So, Now we can put everything together.
        // The math here can actually be simplified further, but I think this is the most logical way of thinking about it.

        // 1. Vectorize everything. In our new world, Point A = (0,0) and then all of our other calculations are now just vectors from this point.
        // Translate the line down to (0,0) by subtracting start.x and start.y from both points
        const lineVector = new Line(
          new Point(0, 0),
          new Point(line.end.x - line.start.x, line.end.y - line.start.y)
        );
        // 2. Create the 90 degree vector using the formula (-end.y, end.x) per the math above
        const possibleNormal = new Line(
          new Point(0, 0),
          new Point(-lineVector.end.y, lineVector.end.x)
        );
        // 2a. Create the 270 degree normal vector using the (end.y, -end.x) formula
        const alternativeNormal = new Line(
          new Point(0, 0),
          new Point(lineVector.end.y, -lineVector.end.x)
        );
        // 3. Create the reference vector A-->C
        const furtherInsideVector = new Line(
          new Point(0, 0),
          new Point(
            nextLine.end.x - line.start.x,
            nextLine.end.y - line.start.y
          )
        );
        // 4. Calculate the inner product (dot product for euclidean space) of these two vectors e.g (x1 * x2) + (y1 * y2)
        const innerProduct =
          possibleNormal.end.x * furtherInsideVector.end.x +
          possibleNormal.end.y * furtherInsideVector.end.y;

        // Since the dot product = length of vectors * cos() of the angle between them

        if (innerProduct === 0) {
          throw new Error(
            `Polygon ${this.title} contains two lines that should have been combined into one`
          );
        }

        // 5. Check the angle and choose which normal to use
        const normalVector =
          innerProduct < 0 ? possibleNormal : alternativeNormal;

        // 6. translate the vector back to the the original location and turn it back to a line
        const normal = new Line(
          new Point(line.start.x, line.start.y),
          new Point(
            normalVector.end.x + line.start.x,
            normalVector.end.y + line.start.y
          )
        );
        normals.push(normal);
      }
      return normals;
    });
  }
}
