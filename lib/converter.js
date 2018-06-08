const mdjson = require('metadata-json');
const constants = require('./constants');

var entityHolder = {};

class converter {

    constructor() {
        this.model = null;
        this.diagnostics = [];
    }

    addDiagnostic(diagnostic) {
        this.diagnostics.push(diagnostic);
    }

    toModel(entities) {
        var model = entities.map(e => this.toEntity(e));
        /*return {
            model: model,
            diagnostics: this.diagnostics
        };*/
        return new Promise((resolve, reject) => {
            if (this.diagnostics.length == 0) {
                resolve(model);
            } else {
                reject(this.diagnostics);
            }
        });
    }

    toEntity(umlClass) {
        let entity;

        entity = {
            name: umlClass.name,
            properties: [],
            relationships: []
        };

        entityHolder[entity.name] = entity; //Add to entityHolder

        //Map properties
        entity.properties = umlClass.attributes.map(p => this.toAttribute(p));

        //Relationships
        let umlAssociations = umlClass.getChildren().filter(e => e instanceof type.UMLAssociation);
        umlAssociations.forEach(a => {
            this.determineNavigability(a);
        });

        return entity;
    }

    toAttribute(umlAttribute) {
        let attribute = {
            name: umlAttribute.name,
            type: umlAttribute.type,
            required: false
        };

        if (umlAttribute.multiplicity === constants.one) {
            attribute.required = true;
        }
        return attribute;
    }

    toRelationship(umlAssociation) {

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
        if (!end1Multiplicity || end1Multiplicity === constants.zeroOrOne || end1Multiplicity === constants.one) {  //Then left side is 'One'
            //Determine right side multiplicity
            if (!end2Multiplicity || end2Multiplicity === constants.zeroOrOne || end2Multiplicity === constants.one) {  //Then right side is 'One'
                relationship.type = constants.OneToOne;
            } else if (end2Multiplicity === constants.zeroOrMany || end2Multiplicity === constants.oneOrMany || end2Multiplicity === constants.many) {    //Then right side is 'Many'
                relationship.type = constants.OneToMany
            } else {
                this.addDiagnostic("Unknown multiplicity: " + end2Multiplicity + " in UML Association: " + umlAssociation);
                //throw new Error("Unknown multiplicity: " + end2Multiplicity + " in UML Association: " + umlAssociation);
            }
        } else if (end1Multiplicity === constants.zeroOrMany || end1Multiplicity === constants.oneOrMany || end1Multiplicity === constants.many) {    //Then right side is 'Many'
            //Determine right side multiplicity
            if (!end2Multiplicity || end2Multiplicity === zeroOrOne || end2Multiplicity === one) {  //Then right side is 'One'
                relationship.type = constants.ManyToOne;
            } else if (end2Multiplicity === constants.zeroOrMany || end2Multiplicity === constants.oneOrMany || end2Multiplicity === constants.many) { //Then right side is 'Many'
                relationship.type = constants.ManyToMany;
            } else {
                this.addDiagnostic("Unknown multiplicity: " + end2Multiplicity + " in UML Association: " + umlAssociation);
                //throw new Error("Unknown multiplicity: " + end2Multiplicity + " in UML Association: " + umlAssociation);
            }
        }

        //Determine required validator
        if (end2Multiplicity === constants.one || end2Multiplicity === constants.oneOrMany) {
            relationship.required = true;
        }

        return relationship;
    }

    determineNavigability(umlAssociation) {

        let relationship = this.toRelationship(umlAssociation);

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
            this.addDiagnostic("There is no navigability in relationship between Entity " + end1.reference.name + " and Entity " + end2.reference.name);
            //throw new Error("There is no navigability in relationship between Entity " + end1.reference.name + " and Entity " + end2.reference.name);
        }
    }
}

module.exports = converter;