import parse from './dist/index.js';
import fs from 'fs';
import process from 'process';

const filename = process.argv[2];
const geojson = JSON.parse(fs.readFileSync(filename));
const stats = parse(geojson);

console.log('Global track stats\n');
stats.tracks.forEach((track) =>
  console.log(`Track ${track.title}:\t${track.distance().toFixed(2)}`)
);
console.log('\n\nPolygon stats\n');
stats.polygons
  .filter((polygon) => polygon.isValid())
  .forEach((polygon) => {
    const distance = stats.tracks.reduce(
      (acc, track) => acc + polygon.clip(track).distance(),
      0
    );
    console.log(`Polygon ${polygon.title}:\t${distance.toFixed(2)}`);
  });

const invalidPolygons = stats.polygons.filter((polygon) => !polygon.isValid());
if (invalidPolygons.length > 0) {
  console.log(
    '\n\n WARNING: The following areas are not convex polygons and were excluded\n'
  );
  invalidPolygons.forEach((polygon) => console.log(polygon.title));
}
