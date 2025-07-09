const fs = require('fs');
const readline = require('readline');
const path = require('path');
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
    { name: 'inputFile', alias: 'i', type: String },
    { name: 'outputFile', alias: 'o', type: String },
    { name: 'tableName', alias: 't', type: String }
];
const args = commandLineArgs(optionDefinitions);

// Configuration
const inputFilePath = args.inputFile;
const outputFilePath = args.outputFile;         // resulting .sql file
const tableName = args.tableName;         // your target SQL table

const fieldMap = getFieldMap(tableName);

// Ordered MySQL column names (excluding auto-increment ID)
const fields = Object.keys(fieldMap);

// Escapes values for safe MySQL import
function escapeMySQL(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';

  const escaped = String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');

  return `'${escaped}'`;
}

// Converts source JSON object into an INSERT SQL statement
function jsonToSQL(jsonObj) {
  const values = fields.map((column) => {
    const sourceKey = fieldMap[column];
    let val = jsonObj[sourceKey];

    if ((column === 'created_at' || column === 'updated_at') && !val) {
      return 'CURRENT_TIMESTAMP';
    }
    if (column === 'created_by' && !val) return 1;
    if (column === 'parent_category_id' && val) return val.split('/')[3];
    if (column === 'institution_id' && val) return val.id;
    if (column === 'category_id' && val) return val.id;
    if (column === 'currency' && val) return escapeMySQL(val.code);

    return escapeMySQL(val);
  });

  const sql = `INSERT INTO \`${tableName}\` (${fields.join(', ')}) VALUES (${values.join(', ')});`;
  return sql;
}

// Main function
async function processJsonlToSql(inputPath, outputPath) {
  const readStream = fs.createReadStream(inputPath, 'utf8');
  const rl = readline.createInterface({ input: readStream });

  const writeStream = fs.createWriteStream(outputPath, { flags: 'w' });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      const jsonObj = JSON.parse(trimmed);
      const insertSQL = jsonToSQL(jsonObj);
      writeStream.write(insertSQL + '\n');
    } catch (err) {
      console.error('❌ Error parsing line:', line);
      console.error(err);
    }
  }

  writeStream.end();
  console.log(`✅ SQL file written to: ${outputPath}`);
}

processJsonlToSql(inputFilePath, outputFilePath).catch(console.error);

// Mapping: MySQL column name => Source JSON property name
function getFieldMap(source) {
    switch(source) {
        case 'institutions':
            return {
                id: 'id',
                name: 'name',
                type: 'type',
                description: 'description',
                address: 'address',
                schedule: 'schedule',
                website: 'webpage',
                email: 'email',
                facebook_url: 'facebookURL',
                twitter_url: 'twitterURL',
                created_by: '',
                updated_by: '',
                created_at: '',
                updated_at: ''
            }
        case 'categories':
            return {
                id: 'id',
                name: 'name',
                description: 'description',
                parent_category_id: 'category',
                created_by: '',
                updated_by: '',
                created_at: '',
                updated_at: ''
            }
        case 'procedures':
            return {
                id: 'id',
                title: 'name',
                category_id: 'subcategory',
                institution_id: 'institution',
                description: 'description',
                normative: 'normative',
                instructions: 'instructions',
                requirements: 'requirements',
                cost: 'cost',
                currency: 'currency',
                response_time: 'timeResponse',
                result_type: 'typeOfDocumentObtainable',
                url: 'url',
                created_by: '',
                updated_by: '',
                created_at: '',
                updated_at: ''
            }
    }
}
