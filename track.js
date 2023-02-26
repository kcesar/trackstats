import { fromLatLon } from 'utm';
import Line from './line.js';
import Memo from './memo.js';
import Point from './point.js';
export default class Track {
  constructor({ id, geometry: { coordinates }, properties: { title } }) {
    this.id = id;
    this.title = title;
    this.longLat = coordinates;
    this.utmZone = null;
    this.cache = new Memo();
  }

  points() {
    return this.cache.memo('points', () => {
      const utm = this.longLat.map(([long, lat]) => fromLatLon(lat, long));
      this.utmZone = utm[0]?.zoneLetter;
      return utm.map((data) => Point.fromUtm(data, this.utmZone));
    });
  }

  lines() {
    return this.cache.memo('lines', () => {
      const starts = this.points().slice(0, -1);
      const ends = this.points().slice(1);
      return starts.map((start, i) => new Line(start, ends[i]));
    });
  }

  distance() {
    return this.cache.memo('distance', () =>
      this.lines().reduce((acc, line) => acc + line.distance(), 0)
    );
  }
}
