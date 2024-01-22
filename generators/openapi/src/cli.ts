import { writeOpenApi } from "./writeOpenApi";

const pathToJson = process.argv[process.argv.length - 1];
if (pathToJson == null) {
    throw new Error("No argument for config filepath.");
}
const mode = process.argv[process.argv.length - 2];
if (mode == null || (mode !== "stoplight" && mode !== "openapi")) {
    throw new Error("No mode for config filepath.");
}

void writeOpenApi(mode, pathToJson);
