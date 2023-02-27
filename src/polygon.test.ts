import Polygon, { PolygonGeoJSON } from './polygon';
import { Line, Point } from 'cyrus-beck';
import Track from './track';

const coordinates: [Array<[number, number]>] = [
  [
    [-122.5682104561076, 48.01538542090632],
    [-122.56821582052562, 48.01449548366046],
    [-122.5668800804362, 48.01447754121933],
    [-122.56686935160015, 48.01538542090632],
    [-122.56819972727153, 48.01538183248054],
    [-122.56819972727153, 48.01538542090632],
    [-122.56819972727153, 48.01538183248054],
  ],
];

const template: PolygonGeoJSON = {
  geometry: {
    coordinates,
    type: 'Polygon',
  },
  id: '2f03480e-00e1-4de1-b356-87ed48d3f301',
  type: 'Feature',
  properties: {
    'stroke-opacity': 1,
    creator: '050TJ0',
    description: '',
    'stroke-width': 1,
    title: 'G4',
    fill: '#0000FF',
    stroke: '#0000FF',
    'fill-opacity': 0,
    class: 'Shape',
    updated: 1677088493000,
    folderId: 'ff85abe7-9c99-473a-9290-78238c4e57e9',
    gpstype: 'TRACK',
  },
};

test('parses a GeoJSON polygon object', () => {
  const json = { ...template };
  const polygon = new Polygon(json);
  expect(polygon.lines()).toEqual([
    new Line(new Point(532200, 5318100), new Point(532200, 5318002)),
    new Line(new Point(532200, 5318002), new Point(532300, 5318000)),
    new Line(new Point(532300, 5318000), new Point(532300, 5318101)),
    new Line(new Point(532300, 5318101), new Point(532201, 5318100)),
    new Line(new Point(532201, 5318100), new Point(532200, 5318100)),
  ]);
});
