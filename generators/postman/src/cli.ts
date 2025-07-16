import { writePostmanCollection } from "./writePostmanCollection";

const pathToJson = process.argv[process.argv.length - 1];
if (pathToJson == null) {
    throw new Error("No argument for config filepath.");
}

void writePostmanCollection(pathToJson);
