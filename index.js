#!/usr/bin/env node
const JSONStream = require('JSONStream');
const es = require('event-stream');
const CSV = require('csv-string');

process.stdin.setEncoding('utf8');
let header = [
    "ID",
    "Institución",
    "Trámite",
    "URL",
    "URL Catálogo" /*,
    "Descripción",
    "Normativa",
    "Requerimientos",
    "Pasos",
    "Costo",
    "Descripción Costo",
    "Tiempo de Respuesta",
    "Resultado",
    "Categoría"*/
];
process.stdout.write(CSV.stringify(header));

process.stdin
.pipe(JSONStream.parse())
.pipe(es.mapSync(function (obj) {
    let row = [
        obj.id,
        obj.institution.name,
        obj.name,
        obj.url,
        "https://tramites.gob.gt/servicio/" + obj.id + "/" /*,
        obj.description,
        obj.normative,
        obj.requirements,
        obj.instructions,
        obj.currency.symbol + " " + obj.cost,
        obj.variableCostDescription,
        obj.timeResponse,
        obj.typeOfDocumentObtainable,
        obj.subcategory.name*/
    ]

    return CSV.stringify(row);
}))
.pipe(process.stdout);
