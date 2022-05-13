import { runPlugin } from "./plugin/runPlugin";

const pathToJson = process.argv[process.argv.length - 1];
if (pathToJson == null) {
    throw new Error("No argument for config filepath.");
}

void runPlugin(pathToJson);
