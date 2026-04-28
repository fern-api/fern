import { FernYmlSchema } from "../lib/index.js";
import { toJSONSchema } from "zod";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "..", "..", "..", "..", "fern-yml.schema.json");

const schema = toJSONSchema(FernYmlSchema);
writeFileSync(outputPath, JSON.stringify(schema, null, 2) + "\n");
