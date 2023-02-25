import Track from './track.js';
import Line from './line.js';

export { Track, Line };

const parse = (geoJSON) => {
  const features = geoJSON.features ?? [];
  return features
    .map((feature) => {
      switch (feature.geometry?.type) {
        case 'LineString':
          return new Track(feature);
      }
    })
    .filter((x) => x);
};
export default parse;
