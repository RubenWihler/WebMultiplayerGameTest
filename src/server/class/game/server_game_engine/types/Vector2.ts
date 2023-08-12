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

export function randomVector2(): Vector2 {
    const vector = {
        x:  (Math.random() - 0.5) * 2,
        y:  (Math.random() - 0.5) * 2
    };

    return normalize(vector);
}

export function normalize(vector2: Vector2): Vector2 {
    const length = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
    
    if (length === 0) {
        return { x: 0, y: 0 }; // Avoid division by zero
    }
    
    const normalizedX = vector2.x / length;
    const normalizedY = vector2.y / length;
    
    return { x: normalizedX, y: normalizedY };
}

export function dotProduct(vector1: Vector2, vector2: Vector2): number {
    return vector1.x * vector2.x + vector1.y * vector2.y;
}