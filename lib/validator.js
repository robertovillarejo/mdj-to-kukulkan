class ModelValidator {
    constructor(entityValidator) {
        this.entityValidator = entityValidator;
        this.diagnostics = [];
    }
    validate(element) {
        element.entities.forEach(entity => {
            this.diagnostics.concat(this.entityValidator.validate(entity));
        });
        return this.diagnostics;
    }
}

class EntityValidator {
    constructor(rules, attributeValidator, relationshipValidator) {
        this.rules = rules || [];
        this.attributeValidator = attributeValidator;
        this.relationshipValidator = relationshipValidator;
        this.diagnostics = [];
    }

    validate(element) {
        //Apply entity rules
        this.rules.forEach(rule => {
            if (!rule.apply(element)) {
                return false;
            }
        });
        //Apply attribute rules
        element.properties.forEach(p => {
            this.diagnostics.concat(this.attributeValidator.validate(p));
        });
        //Apply relationship rules
        element.relationships.forEach(r => {
            this.diagnostics.concat(this.relationshipValidator.validate(r));
        });
        return this.diagnostics;
    }
}

class AttributeValidator {
    constructor(rules) {
        this.rules = rules;
        this.diagnostics = [];
    }
    validate(element) {
        console.log("Validating attributes");
        this.diagnostics = this.rules.map(rule => {
            return rule.apply(element);
        });
        return this.diagnostics;
    }
}

class RelationshipValidator {
    constructor(rules) {
        this.rules = rules || [];
    }
    validate(element) {
        this.rules.forEach(rule => {
            if (!rule.apply(element)) {
                return false;
            }
        });
        return true;
    }
}

class Rule {
    constructor(name, expression) {
        this.name = name;
        this.expression = expression;
        this.diagnostic = new Diagnostic(this);
    }
    apply(element) {
        console.log("Applying rule...");
        return this.expression(element, this.diagnostic);
    }
}

class Diagnostic {
    constructor(rule) {
        this.rule = rule;
        this.passed = false;
        this.messagge = null;
    }
}

//Implementation
const attributeRules = [];
attributeRules.push(new Rule("checkNotNullAttributeName", (a, diagnostic) => {
    if (a.name === null) {
        diagnostic.messagge = "El nombre del atributo no puede ser nulo!";
        diagnostic.passed = false;
    }
    diagnostic.passed = true;
    return diagnostic;
}));
attributeRules.push(new Rule("checkCamelCaseAttributeName", (a, diagnostic) => {
    return diagnostic;
}));
attributeRules.push(new Rule("checkSupportedDataType", (a, diagnostic) => {
    return diagnostic;
}));
attributeRules.push(new Rule("checkCamelCaseAttributeName", (a, diagnostic) => {
    return diagnostic;
}));
attributeRules.push(new Rule("checkAttributeMultiplicity", (a, diagnostic) => {
    return diagnostic;
}));
const attributeValidator = new AttributeValidator(attributeRules);
const relationshipValidator = new RelationshipValidator();
const entityValidator = new EntityValidator([], attributeValidator, relationshipValidator);
const modelValidator = new ModelValidator(entityValidator);

console.dir(modelValidator.validate({
    entities: [
        {
            name: "Persona",
            properties: [{
                type: "string",
                required: false
            }],
            relationships: []
        }
    ]
}));

