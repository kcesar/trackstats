import Memo from './memo.js';
import UtmPoints from './utmPoints.js';
import { Line, normalize, isValid, getNormals, clip } from 'cyrus-beck';
import ClippedTrack from './clippedTrack.js';
import Track from './track.js';

type PolygonGeoJSON = {
  id: string;
  geometry: {
    coordinates: [Array<[number, number]>];
    type: string;
    [x: string | number]: unknown;
  };
  properties: {
    title: string;
    [x: string | number]: unknown;
  };
  [x: string | number]: unknown;
};

class PolygonError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export default class Polygon {
  id: string;
  title: string;
  utmPoints: UtmPoints;

  cache: Memo;
  constructor({
    id,
    geometry: { coordinates },
    properties: { title } = { title: '' },
  }: PolygonGeoJSON) {
    this.id = id;
    this.title = title;
    this.utmPoints = new UtmPoints(coordinates[0]);
    this.cache = new Memo();
  }

  lines(): Array<Line> {
    return this.cache.memo('lines', () => {
      const lines = this.utmPoints.points().map((point, i, points) => {
        const nextPoint = points[i + 1] ?? points[0];
        return new Line(point, nextPoint);
      });
      return normalize(lines);
    });
  }

  isValid(): boolean {
    return this.cache.memo('isValid', () => isValid(this.lines()));
  }

  clip(track: Track): ClippedTrack {
    if (!this.isValid()) {
      throw new PolygonError(
        'Cannot calculate calculate clippings from an invalid polygon'
      );
    }
    const normals = this.cache.memo('normals', () => getNormals(this.lines()));
    const clippedLines: Array<Line> = track
      .lines()
      .map((line) =>
        clip(this.lines(), line, {
          normals,
          skipNormalization: true,
          skipValidation: true,
        })
      )
      // https://stackoverflow.com/a/51577579
      .filter((x): x is Line => x != null);
    return new ClippedTrack(track, clippedLines);
  }
}

export { PolygonError, PolygonGeoJSON };
