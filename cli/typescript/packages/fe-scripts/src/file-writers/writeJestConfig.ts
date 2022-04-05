import path from "path";
import { createFileWriter, FileWriterArgs } from "./utils/createFileWriter";
import { getPathToShared } from "./utils/getPathToShared";

export const writeJestConfig = createFileWriter({
    relativePath: "jest.config.js",
    isForBundlesOnly: false,
    generateFile: generateJestConfig,
});

function generateJestConfig({ lernaPackage }: FileWriterArgs): string {
    const pathToShared = getPathToShared(lernaPackage);
    return `module.exports = {
    ...require("${path.join(pathToShared, "jest.config.shared.json")}"),
};`;
}
