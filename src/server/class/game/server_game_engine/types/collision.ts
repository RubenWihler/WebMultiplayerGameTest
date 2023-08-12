import Entity from "../game_objects/entities/entity.js";

export function aabbCollision(entity: Entity, entity2: Entity): boolean {
    return entity.x < entity2.x + entity2.width &&
        entity.x + entity.width > entity2.x &&
        entity.y < entity2.y + entity2.height &&
        entity.y + entity.height > entity2.y;
}

function valueInRange(value: number, min: number, max: number): boolean {
    return (value >= min) && (value <= max);
}
