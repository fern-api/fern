import { writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { toJSONSchema } from "zod";
import { FernYmlSchema } from "../lib/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "..", "..", "..", "..", "fern-yml.schema.json");

const schema = toJSONSchema(FernYmlSchema);
writeFileSync(outputPath, JSON.stringify(schema, null, 2) + "\n");
