const { readFileSync } = require("fs");
const { join } = require("path");
const { convertToWireMock } = require("./dist/convertToWireMock");

const irPath = join(__dirname, "test", "fixtures", "hackernews", "ir.json");
const irJson = JSON.parse(readFileSync(irPath, "utf-8"));
const result = convertToWireMock(irJson);

// Show a mapping with path parameters
const withParams = result.mappings.find(m => m.request.pathParameters);
console.log("Mapping with path parameters:");
console.log(JSON.stringify(withParams, null, 2));

// Show a mapping without path parameters
const withoutParams = result.mappings.find(m => m.request.pathParameters === undefined);
console.log("\n\nMapping without path parameters:");
console.log(JSON.stringify(withoutParams, null, 2));
