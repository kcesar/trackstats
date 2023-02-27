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

  static fromCartesian({ id, title, points, utmZone }) {
    const track = new Track({
      id,
      geometry: { coordinates: [] },
      properties: { title },
    });
    track.utmZone = utmZone;
    track.cache.memo('points', () => points);
    return track;
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

export class ClippedTrack extends Track {
  constructor(track, lines) {
    super({
      id: track.id,
      geometry: { coordinates: [] },
      properties: { title: track.title },
    });
    this.cache.memo('lines', () => lines);
  }

  points() {
    throw new Error('A clipped track may be disjoint and doesnt have points');
  }
}
