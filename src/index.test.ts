import parse from './index.js';

test('parse an example file', () => {
  const coordinates: Array<[number, number]> = [
    [-122.5677960035426, 48.01525535512736],
    [-122.56781746121472, 48.01525535512736],
  ];
  const json = {
    features: [
      {
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
          coordinates,
          type: 'LineString',
        },
      },
    ],
  };
  const parsed = parse(json);
  expect(parsed.tracks[0]?.title).toEqual('T17');
});
