import Memo from './memo.js';
import { Point, Line } from 'cyrus-beck';
import UtmPoints from './utmPoints.js';

type TrackGeoJSON = {
  id: string;
  geometry: {
    coordinates: Array<[number, number]>;
    type: string;
    [x: string | number]: unknown;
  };
  properties: {
    title: string;
    [x: string | number]: unknown;
  };
  [x: string | number]: unknown;
};

export default class Track {
  id: string;
  title: string;
  utmPoints: UtmPoints;
  cache: Memo;
  constructor({
    id,
    geometry: { coordinates },
    properties: { title } = { title: '' },
  }: TrackGeoJSON) {
    this.id = id;
    this.title = title;
    this.utmPoints = new UtmPoints(coordinates);
    this.cache = new Memo();
  }

  points(): Array<Point> {
    return this.utmPoints.points();
  }

  lines(): Array<Line> {
    return this.cache.memo('lines', () =>
      this.points().map((point, i, points) => {
        const nextPoint = points[i + 1] ?? points[0];
        return new Line(point, nextPoint);
      })
    );
  }

  distance(): number {
    return this.cache.memo('distance', () =>
      this.lines().reduce((acc, line) => acc + line.distance(), 0)
    );
  }
}
export { TrackGeoJSON };
