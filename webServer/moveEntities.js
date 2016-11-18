var moveEntities = { //Currently mutates entities
    microMove: 8, //How far each step for an entity is per tick.  Could make entity specific, should be relative to tickrate
    changes: {},
    entities: {},
    setChange(entityId, key, value) {
        if (key === 'wholeEntity') {
            this.entities[entityId] = value;
            this.changes[entityId] = value;
        } else {
            this.entities[entityId][key] = value;
            if (!this.changes[entityId]) {
                this.changes[entityId] = {};
            }
            this.changes[entityId][key] = value;
        }
    },
    moveEntities(entities) { //This is global scope for some reason, maybe because it is called
        moveEntities.changes = {};
        if (!moveEntities.microMove) {
            return {};
        }
        moveEntities.entities = entities;
        //NextNode is actually the current node, but called nextNode because currentNode should be derived from x, y
        //Previous node is the previous node
        //These two are used for animation of direction facing
        var howClose = moveEntities.microMove + 1;
        var more = false; //If there are still entities walking after the move
        for (var e in entities) {
            var entity = entities[e];
            if (entity.health <= 0) {
                entity.path = [];
                continue;
            }
            if (entity.path.length > 0) { //If the entity has a path
                var dest = {
                    x: ~~(entity.path[entity.path.length - 1].x * 32),
                    y: ~~(entity.path[entity.path.length - 1].y * 32)
                };
                //entity.previousNode.x === entity.nextNode.x is so that we don't move from current to a node in the wrong direction, ie we don't actually want to go to nodes sometimes
                if ((Math.abs(dest.x - entity.x) <= howClose || entity.previousNode.x === entity.nextNode.x) && (Math.abs(dest.y - entity.y) <= howClose || entity.previousNode.y === entity.nextNode.y)) {
                    entity.previousNode = entity.nextNode;
                    entity.nextNode = entity.path.pop();
                    moveEntities.setChange(entity.id, 'previousNode', entity.previousNode);
                    moveEntities.setChange(entity.id, 'nextNode', entity.nextNode);
                    var dest = {
                        x: ~~(entity.nextNode.x * 32),
                        y: ~~(entity.nextNode.y * 32)
                    };
                }
                moveEntities.microMoveTowardPoint(entity, dest, moveEntities.microMove, howClose, (entity.previousNode.x === entity.nextNode.x), (entity.previousNode.y === entity.nextNode.y));
                more = true;
                if (!entity.walking) {
                    entity.walking = true;
                    moveEntities.setChange(entity.id, 'walking', true);
                }
            } //If the entity is not at the heading
            else if (entity.heading.x !== entity.x || entity.heading.y !== entity.y) { //Math.abs(entity.heading.x - entity.x) <= .001 && Math.abs(entity.heading.y - entity.y) <= .001) {
                if (Math.abs(entity.heading.x - entity.x) > 5 || Math.abs(entity.heading.y - entity.y) > 5) {
                    moveEntities.microMoveTowardPoint(entity, entity.heading, 4, 5);
                } else {
                    moveEntities.setChange(entity.id, 'x', entity.heading.x);
                    moveEntities.setChange(entity.id, 'y', entity.heading.y);
                }
                more = true;
                if (!entity.walking) {
                    entity.walking = true;
                    moveEntities.setChange(entity.id, 'walking', true);
                }
            } //Not walking
            else {
                if (entity.walking) {
                    entity.walking = false;
                    moveEntities.setChange(entity.id, 'walking', false);
                }
            }
        }
        return moveEntities.changes;
    },
    microMoveTowardPoint(entity, point, microMove, howClose, lockX, lockY) { //mutates entity
        if (!lockX) {
            if (entity.x > point.x + howClose) {
                entity.x -= microMove;
                this.setChange(entity.id, 'x', entity.x);
            } else if (entity.x < point.x - howClose) {
                entity.x += microMove;
                this.setChange(entity.id, 'x', entity.x);
            }
        }
        if (!lockY) {
            if (entity.y > point.y + howClose) {
                entity.y -= microMove;
                this.setChange(entity.id, 'y', entity.y);
            } else if (entity.y < point.y - howClose) {
                entity.y += microMove;
                this.setChange(entity.id, 'y', entity.y);
            }
        }
    }
}
exports.moveEntities = moveEntities;
