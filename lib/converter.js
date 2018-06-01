var mdjson = require('metadata-json');

function toProperty(umlAttribute) {
    return {
        name: umlAttribute.name,
        type: umlAttribute.type
    }
}

const OneToOne = "OneToOne";
const OneToMany = "OneToMany";
const ManyToOne = "ManyToOne";
const ManyToMany = "ManyToMany";

function determineRelationshipType(umlAssociation) {
    if (!umlAssociation.end1.multiplicity && !umlAssociation.end2.multiplicity) {
        return OneToOne;
    } else if (umlAssociation.end1.multiplicity === "0..1") {
        return OneToOne;
    }
    return OneToOne;
}

function toRelationship(umlAssociation) {
    return {
        name: umlAssociation.name,
        targetEntity: umlAssociation.end2.reference.name,
        sourceEntity: umlAssociation.end1.reference.name,
        type: determineRelationshipType(umlAssociation),
        required: false
    }
}

function toEntity(umlClass) {
    var entity;

    entity = {
        name: umlClass.name,
        properties: [],
        relationships: []
    };
    //Map properties
    entity.properties = umlClass.attributes.map(p => toProperty(p));

    //Map relationships
    entity.relationships = umlClass.getChildren().filter(e => e instanceof type.UMLAssociation).map(a => toRelationship(a));
    return entity;
}

function toModel(entities) {
    var model = entities.map(e => toEntity(e));
    return model;
};

module.exports = toModel;