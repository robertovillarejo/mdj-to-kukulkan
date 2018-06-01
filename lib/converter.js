var mdjson = require('metadata-json');

function toProperty(umlAttribute) {
    return {
        name: umlAttribute.name,
        type: umlAttribute.type
    }
}

function toEntity(umlClass) {
    var entity;

    entity = {
        name: umlClass.name,
        properties: []
    };
    //Map properties
    entity.properties = umlClass.attributes.map(p => toProperty(p));
    return entity;
}

function toModel(entities) {
    var model = entities.map(e => toEntity(e));
    return model;
};

module.exports = toModel;