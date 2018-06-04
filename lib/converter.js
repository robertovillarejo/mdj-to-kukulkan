const mdjson = require('metadata-json');

var entityHolder = {};

//UML Multiplicities
const zeroOrOne = "0..1";
const one = "1";
const zeroOrMany = "0..*";
const oneOrMany = "1..*";
const many = "*";

//Relationships types
const OneToOne = "OneToOne";
const OneToMany = "OneToMany";
const ManyToOne = "ManyToOne";
const ManyToMany = "ManyToMany";

function toAttribute(umlAttribute) {
    let attribute = {
        name: umlAttribute.name,
        type: umlAttribute.type,
        required: false
    };

    if (umlAttribute.multiplicity === one) {
        attribute.required = true;
    }
    return attribute;
}

function toRelationship(umlAssociation) {

    let relationship = {
        attributeName: null,
        sourceEntity: null,
        targetEntity: null,
        type: null,
        required: false,
        attributeNameInTarget: null
    }

    let end1Multiplicity = umlAssociation.end1.multiplicity;
    let end2Multiplicity = umlAssociation.end2.multiplicity;

    //Determine left side multiplicity
    if (!end1Multiplicity || end1Multiplicity === zeroOrOne || end1Multiplicity === one) {  //Then left side is 'One'
        //Determine right side multiplicity
        if (!end2Multiplicity || end2Multiplicity === zeroOrOne || end2Multiplicity === one) {  //Then right side is 'One'
            relationship.type = OneToOne;
        } else if (end2Multiplicity === zeroOrMany || end2Multiplicity === oneOrMany || end2Multiplicity === many) {    //Then right side is 'Many'
            relationship.type = OneToMany
        } else {
            throw new Error("Unknown multiplicity: " + end2Multiplicity + " in UML Association: " + umlAssociation);
        }
    } else if (end1Multiplicity === zeroOrMany || end1Multiplicity === oneOrMany || end1Multiplicity === many) {    //Then right side is 'Many'
        //Determine right side multiplicity
        if (!end2Multiplicity || end2Multiplicity === zeroOrOne || end2Multiplicity === one) {  //Then right side is 'One'
            relationship.type = ManyToOne;
        } else if (end2Multiplicity === zeroOrMany || end2Multiplicity === oneOrMany || end2Multiplicity === many) { //Then right side is 'Many'
            relationship.type = ManyToMany;
        } else {
            throw new Error("Unknown multiplicity: " + end2Multiplicity + " in UML Association: " + umlAssociation);
        }
    }

    //Determine required validator
    if (end2Multiplicity === one || end2Multiplicity === oneOrMany) {
        relationship.required = true;
    }

    return relationship;
}

function determineNavigability(umlAssociation) {

    let relationship = toRelationship(umlAssociation);

    let end1 = umlAssociation.end1;
    let end2 = umlAssociation.end2;

    relationship.sourceEntity = end1.reference.name;
    relationship.targetEntity = end2.reference.name;

    if (end1.navigable && end2.navigable) { //Left entity is owner & bidirectional
        relationship.attributeName = end2.name;
        relationship.attributeNameInTarget = end1.name;
        if (entityHolder[end1.reference.name]) {    //Get from entity holder
            let ownerEntity = entityHolder[end1.reference.name];
            ownerEntity.relationships.push(relationship);
        }
    } else if (!end1.navigable && end2.navigable) { //Left entity is owner & unidirectional
        relationship.attributeName = end2.name;
        if (entityHolder[end1.reference.name]) {    //Get from entity holder
            let ownerEntity = entityHolder[end1.reference.name];
            ownerEntity.relationships.push(relationship);
        }
    } else if (end1.navigable && !end2.navigable) { //Right side is owner & unidirectional
        relationship.sourceEntity = end2.reference.name;
        relationship.targetEntity = end1.reference.name;
        relationship.attributeName = end1.name;
        if (entityHolder[end2.reference.name]) {    //Get from entity holder
            let ownerEntity = entityHolder[end2.reference.name];
            ownerEntity.relationships.push(relationship);
        }
    } else if (!end1.navigable && !end2.navigable) { //None entity is navigable
        throw new Error("There is no navigability in relationship between Entity " + end1.reference.name + " and Entity " + end2.reference.name);
    }
}

function toEntity(umlClass) {
    var entity;

    entity = {
        name: umlClass.name,
        properties: [],
        relationships: []
    };

    entityHolder[entity.name] = entity; //Add to entityHolder

    //Map properties
    entity.properties = umlClass.attributes.map(p => toAttribute(p));

    //Relationships
    let umlAssociations = umlClass.getChildren().filter(e => e instanceof type.UMLAssociation);
    umlAssociations.forEach(a => {
        determineNavigability(a);
    });

    return entity;
}

function toModel(entities) {
    var model = entities.map(e => toEntity(e));
    return model;
};

module.exports = toModel;