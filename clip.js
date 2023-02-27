import Line from './line.js';
import Point from './point.js';
import Vector from './vector.js';
import { ClippedTrack } from './track.js';

const dot = (point, otherPoint) =>
  point.x * otherPoint.x + point.y * otherPoint.y;

// Taken from https://www.geeksforgeeks.org/line-clipping-set-2-cyrus-beck-algorithm/
const clipLine = (polygon, line) => {
  const P1_P0 = Vector.fromLine(line);
  const P0_PEi = polygon
    .lines()
    .map(
      (edge) =>
        new Point(edge.start.x - line.start.x, edge.start.y - line.start.y)
    );

  const normalVectors = polygon
    .normalLines()
    .map((line) => Vector.fromLine(line));
  const numerators = normalVectors.map((normalEdge, i) =>
    dot(normalEdge, P0_PEi[i])
  );
  const denominators = normalVectors.map((normalEdge) =>
    dot(normalEdge, P1_P0)
  );

  const times = numerators.map((numerator, i) => numerator / denominators[i]);

  const enterTimes = times
    .map((time, i) => (denominators[i] > 0 ? time : null))
    .filter((x) => x != null);
  const leaveTimes = times
    .map((time, i) => (denominators[i] <= 0 ? time : null))
    .filter((x) => x != null);

  const maxEnterTime = Math.max(0, ...enterTimes);
  const minLeaveTime = Math.min(1, ...leaveTimes);

  if (maxEnterTime > minLeaveTime) {
    return null;
  }
  return new Line(
    new Point(
      line.start.x + P1_P0.x * maxEnterTime,
      line.start.y + P1_P0.y * maxEnterTime
    ),
    new Point(
      line.start.x + P1_P0.x * minLeaveTime,
      line.start.y + P1_P0.y * minLeaveTime
    )
  );
};

const clipLineNotWorking = (polygon, line) => {
  // Algorithm adapted from https://web.archive.org/web/20101203041134/http://cs1.bradley.edu/public/jcm/cs535CyrusBeck.html
  let lineVector = Vector.fromLine(line);

  // When considering a line as a parametric equation (based on the dependent variable time)
  // You get the formula P(t) = P0 + t(P1 - P0)
  // E.g. the point at a given time is based off the inital point plus the slope * time
  // (e.g. y = mx + b) if x were a time unit

  // From the Cyrus-Beck proof, we know that for a given edge
  // time = (normal <dot> line->edge vector) / (normal <dot> line vector)

  // Since the line is directional (going from start -> end)
  // We have the following possibilities:
  // 1) Line is wholly contained within the clipping region or wholly outside the clipping region
  // 2) The line enters into the clipping region and terminates before exiting
  // 3) The line enters, then exits through another edge
  // 4) The line starts within the clipping region, then finally exits

  // Given the parametric equation then, there are <= 2 times (enter, and exit) where the
  // line might cross an edge
  // We can keep track of the enterTime and exitTime as we go about solving the Cyrus-Beck equation

  // For reasons not entirely clear to me the time interval that we're interested in is capped at 1
  let enterTime = 0.0;
  let exitTime = 1.0;
  let visible = true;

  const polygonEdges = polygon.lines();
  const polygonNormals = polygon.normalLines();
  for (let i = 0; i < polygonEdges.length; i++) {
    const edge = polygonEdges[i];
    // The center of our universe is the edge.start point
    // All vectors are in reference to here
    // The normal edge starts from the same location so we just need to vectorize it
    const normalVector = Vector.fromLine(polygonNormals[i]);

    // Create a vector from edge.start to the beginning of the target line
    let startToPolyEdgeVector = new Vector(
      line.start.x - edge.start.x,
      line.start.y - edge.start.y
    );

    const numerator = normalVector.dotProduct(startToPolyEdgeVector);

    // This next line from the algorithm isn't quite as clear to me. The lineVector contains the slope of the line
    // but it hasn't been normalized to the center of the universe. Unclear how this works
    const denominator = normalVector.dotProduct(lineVector);
    if (denominator === 0) {
      // This can only happen if we have a parallel line to the edge
      // Since the polygon is convex, if the line is on the outside of the polygon
      // we can stop now since it will never intersect
      if (numerator >= 0) {
        visible = false;
        break;
      }
    } else {
      const time = -numerator / denominator;
      if (denominator < 0) {
        if (time <= 1.0) {
          enterTime = Math.max(time, enterTime);
        }
      } else if (time >= 0.0) {
        exitTime = Math.min(time, exitTime);
      }
    }
  }

  // Now that we've computed the enter and exit time, we can use the parametric equation
  // to generate the new start and endpoints for the line
  if (enterTime <= exitTime && visible) {
    return new Line(
      new Point(
        line.start.x + enterTime * lineVector.x,
        line.start.y + enterTime * lineVector.y
      ),
      new Point(
        line.start.x + exitTime * lineVector.x,
        line.start.y + exitTime * lineVector.y
      )
    );
  } else {
    return null;
  }
};

const clip = (polygon, track) => {
  const clippedLines = track
    .lines()
    .map((line) => clipLine(polygon, line))
    .filter(Boolean);
  return new ClippedTrack(track, clippedLines);
};
export default clip;
