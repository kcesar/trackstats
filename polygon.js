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
}
