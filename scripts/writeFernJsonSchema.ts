import { writeFernJsonSchema } from "@fern-api/yaml-schema";
import path from "path";

void writeFernJsonSchema(path.join(__dirname, "../fern.schema.json"));
