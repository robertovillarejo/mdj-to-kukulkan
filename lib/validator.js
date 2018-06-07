class ModelValidator {
    constructor(entityValidator, attributeValidator, relationshipValidator) {
        this._entityValidator = entityValidator;
        this._attributeValidator = attributeValidator;
        this._relationshipValidator = relationshipValidator;
    }
    validate(element) {
        element.entities.forEach(entity => {
            this._entityValidator.validate(entity);
        });
    }
}

class EntityValidator {
    constructor(rules) {
        this._rules = rules;
    }

    setAttributeValidator(attributeValidator) {
        this._attributeValidator = _attributeValidator;
    }

    setRelationshipValidator(relationshipValidator) {
        this._relationshipValidator = relationshipValidator;
    }

    validate(element) {
        //Apply entity rules
        this._rules.forEach(rule => {
            if (!rule.apply(element)) {
                return false;
            }
        });
        //Apply attribute rules
        element.attributes.forEach(a => {
            this._attributeValidator.validate(a);
        });
        //Apply relationship rules
        element.relationships.forEach(r => {
            this.relationshipValidator.validate(r);
        });
        return true;
    }
}

class AttributeValidator {
    constructor(rules) {
        this._rules = rules;
        this._diagnostics = [];
    }
    validate(element) {
        console.log("Validating attributes");
        this._diagnostics = this._rules.map(rule => {
            return rule.apply(element);
        });
        return this._diagnostics;
    }
}

class RelationshipValidator {
    constructor(rules) {
        this._rules = rules;
    }
    validate(element) {
        this._rules.forEach(rule => {
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
        this._expression = expression;
        this._diagnostic = new Diagnostic(this);
    }
    apply(element) {
        console.log("Applying rule...");
        return this._expression(element, this._diagnostic);
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
    if (a.name == null) {
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

const attDiags = attributeValidator.validate({
    name: "apellido",
    type: "string",
    required: false
});

console.dir(attDiags);



