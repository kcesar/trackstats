import Line from './line';
import Polygon from './polygon';
import Point from './point';

function testPolygon(points) {
  return Polygon.fromCartesian({
    id: 'foo',
    title: 'bar',
    utmZone: 'T',
    points: points.map(([x, y]) => new Point(x, y)),
  });
}

test('a line is not convex', () => {
  const p = testPolygon([
    [0, 0],
    [1, 0],
  ]);
  expect(p.isConvex()).toBe(false);
});

test('A right triangle is convex', () => {
  const p = testPolygon([
    [0, 0],
    [5, 0],
    [5, 5],
  ]);
  expect(p.isConvex()).toBe(true);
});

test('A right triangle (flipped over x axis) is convex', () => {
  const p = testPolygon([
    [0, 0],
    [5, 0],
    [5, -5],
  ]);
  expect(p.isConvex()).toBe(true);
});

test('An acute triangle is convex', () => {
  const p = testPolygon([
    [-3, -5],
    [-4, 0],
    [1, 1],
  ]);
  expect(p.isConvex()).toBe(true);
});

test('An obtuse triangle is convex', () => {
  const p = testPolygon([
    [0, 0],
    [-2, 5],
    [3, 0],
  ]);
  expect(p.isConvex()).toBe(true);
});

test('An square is convex', () => {
  const p = testPolygon([
    [0, 0],
    [5, 0],
    [5, 5],
    [0, 5],
  ]);
  expect(p.isConvex()).toBe(true);
});

test('An 4 sided shape with a divot is not convex', () => {
  const p = testPolygon([
    [0, 0],
    [1, -3],
    [-1, -4], // Create the pacman
    [50, -50],
  ]);
  expect(p.isConvex()).toBe(false);
});
