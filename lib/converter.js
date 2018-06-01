var mdjson = require('metadata-json');

function toModel(entities) {
    var model = [];

    entities.forEach(e => {
        if (!e instanceof type.UMLClass) return;
        var entity;

        entity = {
            name: e.name,
            properties: []
        };

        e.attributes.forEach(a => {
            entity.properties.push({
                name: a.name,
                type: a.type
            });
        });
        model.push(entity);
    });
    return model;
};

module.exports = toModel;