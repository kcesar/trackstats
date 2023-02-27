import Track, { TrackError } from './track';
const template = {
  id: '2e66f874-21f4-4ae1-95be-8dbe4eb947aa',
  type: 'Feature',
  properties: {
    'stroke-opacity': 1,
    creator: '1NB1Q1',
    pattern: 'solid',
    description: '',
    'stroke-width': 2,
    title: 'T17',
    fill: '#00CD00',
    stroke: '#00CD00',
    class: 'Shape',
    updated: 1677172957000,
    folderId: '0f50df2f-6b44-493b-836c-6017614c19f9',
  },
  geometry: {
    coordinates: [
      [-122.5677960035426, 48.01525535512736],
      [-122.56781746121472, 48.01525535512736],
    ],
  },
};

test('parses a GeoJSON track object', () => {
  const json = { ...template };
  json.geometry = {
    coordinates: [
      [-122.5677960035426, 48.01525535512736],
      [-122.56781746121472, 48.01525535512736],
    ],
  };
  const track = new Track(json);
  expect(track.points()).toEqual([
    { x: 532231, y: 5318086 },
    { x: 532229, y: 5318086 },
  ]);
  expect(track.utmZone).toEqual(10);
  expect(track.utmLetter).toEqual('U');
  expect(track.distance()).toBe(4);
});

test('throws an error if tracks span multiple UTM zones', () => {
  const json = { ...template };
  json.geometry = {
    coordinates: [
      [-122.5677960035426, 48.01525535512736],
      [-93.56781746121472, 48.01525535512736],
    ],
  };
  const track = new Track(json);
  expect(() => track.points()).toThrow(TrackError);
});
test('throws an error if tracks span multiple UTM letters', () => {
  const json = { ...template };
  json.geometry = {
    coordinates: [
      [-122.5677960035426, 48.01525535512736],
      [-122.56781746121472, 73.01525535512736],
    ],
  };
  const track = new Track(json);
  expect(() => track.points()).toThrow(TrackError);
});