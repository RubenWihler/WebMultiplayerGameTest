import Ball from "../game_objects/entities/ball.js";
import Entity from "../game_objects/entities/entity.js";

// Define a function to check for collisions between a rectangle and a ball
export function checkCollision(entity: Entity, ball: Ball) : { collided: boolean, collision_position: { x: number, y: number } | null }{
    const ball_radius = ball.width / 2;

    // Calculate the center of the ball
    const ball_center_x = ball.x + ball.width / 2;
    const ball_center_y = ball.y + ball.height / 2;

    // Calculate the distance between the ball center and the rectangle center
    const distance_x = Math.abs(ball_center_x - entity.x - entity.width / 2);
    const distance_y = Math.abs(ball_center_y - entity.y - entity.height / 2);

    // Check if the distance is within the bounds of the rectangle
    if (distance_x > (entity.width / 2 + ball_radius) ||
        distance_y > (entity.height / 2 + ball_radius)) {
        return { collided: false, collision_position: null };
    }

    // Check if the ball center is inside the rectangle
    if (distance_x <= entity.width / 2 || distance_y <= entity.height / 2) {
        return { collided: true, collision_position: { x: ball_center_x, y: ball_center_y } };
    }

    // Check for corner collisions
    const dx = distance_x - entity.width / 2;
    const dy = distance_y - entity.height / 2;
    if (dx * dx + dy * dy <= (ball_radius * ball_radius)) {
        return { collided: true, collision_position: { x: ball_center_x, y: ball_center_y } };
    }

    return { collided: false, collision_position: null };
}