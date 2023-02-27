import Polygon from './polygon';
import Point from './point';
import Track from './track';

function testPolygon(points) {
  return Polygon.fromCartesian({
    id: 'foo',
    title: 'bar',
    utmZone: 'T',
    points: points.map(([x, y]) => new Point(x, y)),
  });
}

function testTrack(points) {
  return Track.fromCartesian({
    id: 'foo',
    title: 'bar',
    utmZone: 'T',
    points: points.map(([x, y]) => new Point(x, y)),
  });
}

function linesToArrays(lines) {
  return lines.map((line) => [
    [line.start.x, line.start.y],
    [line.end.x, line.end.y],
  ]);
}

describe('isConvex', () => {
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
});

describe('normal lines', () => {
  test('a counter-clockwise rectangle has the correct normal lines', () => {
    const p = testPolygon([
      [0, 0],
      [5, 0],
      [5, 10],
      [0, 10],
    ]);
    expect(linesToArrays(p.normalLines())).toEqual([
      [
        [0, 0],
        [0, -5],
      ],
      [
        [5, 0],
        [15, 0],
      ],
      [
        [5, 10],
        [5, 15],
      ],
      [
        [0, 10],
        [-10, 10],
      ],
    ]);
  });

  test('a clockwise rectangle has the correct normal lines', () => {
    const p = testPolygon([
      [0, 0],
      [0, 10],
      [5, 10],
      [5, 0],
    ]);
    expect(linesToArrays(p.normalLines())).toEqual([
      [
        [0, 0],
        [-10, 0],
      ],
      [
        [0, 10],
        [0, 15],
      ],
      [
        [5, 10],
        [15, 10],
      ],
      [
        [5, 0],
        [5, -5],
      ],
    ]);
  });
});

describe('lines', () => {
  test('a triangle with an extra point in the middle gets removed from lines', () => {
    const p = testPolygon([
      [0, 0],
      [1, 0],
      [2, 0],
      [4, 0],
      [2, 4],
    ]);
    expect(linesToArrays(p.lines())).toEqual([
      [
        [0, 0],
        [4, 0],
      ],
      [
        [4, 0],
        [2, 4],
      ],
      [
        [2, 4],
        [0, 0],
      ],
    ]);
  });

  test('a triangle with an extra point at the wraparound between vertices gets removed from the lines', () => {
    const p = testPolygon([
      [2, 0],
      [4, 0],
      [2, 4],
      [0, 0],
    ]);
    expect(linesToArrays(p.lines())).toEqual([
      [
        [0, 0],
        [4, 0],
      ],
      [
        [4, 0],
        [2, 4],
      ],
      [
        [2, 4],
        [0, 0],
      ],
    ]);
  });

  test('a triangle removing the first vertex and the wraparound from the lines', () => {
    const p = testPolygon([
      [2, 0],
      [3, 0],
      [4, 0],
      [2, 4],
      [0, 0],
    ]);
    expect(linesToArrays(p.lines())).toEqual([
      [
        [0, 0],
        [4, 0],
      ],
      [
        [4, 0],
        [2, 4],
      ],
      [
        [2, 4],
        [0, 0],
      ],
    ]);
  });
});

describe('clipping', () => {
  test('a line wholly within a polygon is not clipped', () => {
    const p = testPolygon([
      [0, 0],
      [5, 0],
      [5, 10],
      [0, 10],
    ]);
    const track = testTrack([
      [2, 2],
      [4, 2],
    ]);
    const clipped = p.clip(track);
    expect(linesToArrays(clipped.lines())).toEqual([
      [
        [2, 2],
        [4, 2],
      ],
    ]);
  });

  test('a parallel line wholly outside a polygon is ignored', () => {
    const p = testPolygon([
      [0, 0],
      [5, 0],
      [5, 10],
      [0, 10],
    ]);
    const track = testTrack([
      [20, 0],
      [40, 0],
    ]);
    const clipped = p.clip(track);
    expect(linesToArrays(clipped.lines())).toEqual([]);
  });

  test('a diagonal line wholly outside a polygon is ignored', () => {
    const p = testPolygon([
      [0, 0],
      [5, 0],
      [5, 10],
      [0, 10],
    ]);
    const track = testTrack([
      [20, 0],
      [40, 10],
    ]);
    const clipped = p.clip(track);
    expect(linesToArrays(clipped.lines())).toEqual([]);
  });
});
