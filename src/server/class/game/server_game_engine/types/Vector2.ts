export default interface Vector2{
    x: number;
    y: number;
}

export function squaredDistance(position1, position2) : number {
  const delta_x = position2.x - position1.x;
  const delta_y = position2.y - position1.y;
  return delta_x * delta_x + delta_y * delta_y;
}

export function distance(position1, position2) : number {
    const squaredDist = squaredDistance(position1, position2);
    return Math.sqrt(squaredDist);
}