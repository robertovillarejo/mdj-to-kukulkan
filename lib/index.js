const mdjson = require('./../node_modules/metadata-json');
const Converter = require('./converter');

function toKukulkanFile(path, outputFile, template) {

    var template = template || __dirname + "/kukulkan.ejs";
    var outputFile = outputFile || __dirname + "/model.3k";

    //Load mdj
    mdjson.loadFromFile(path);

    //Load Repository
    var repo = mdjson.Repository;

    //Select UMLClass(es)
    var classes = repo.select("@UMLClass");

    //Filter UMLClass(es) with stereotype "Business Entity"
    var businessEntities = classes.filter(c => {
        if (c.stereotype) {
            return c.stereotype.name === "Business Entity";
        }
        return false;
    })

    //Transform UMLClass(es) to intermediate model
    const converter = new Converter;
    /*var result = converter.toModel(businessEntities);
    console.log(result.diagnostics);*/

    converter.toModel(businessEntities)
        .then(model => {
            //Render as Kukulkan Grammar
            mdjson.render(template, outputFile, model);
        })
        .catch(diagnostics => {
            console.dir(diagnostics);
        });


}

module.exports = toKukulkanFile;
