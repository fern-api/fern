import path from "path";
import { createFileWriter, FileWriterArgs } from "./utils/createFileWriter";

export const writePrettierRc = createFileWriter({
    relativePath: ".prettierrc.js",
    isForBundlesOnly: false,
    generateFile: generatePrettierRc,
});

function generatePrettierRc({ lernaPackage }: FileWriterArgs): string {
    return `module.exports = { 
    ...require("${path.relative(lernaPackage.location, path.join(lernaPackage.rootPath, ".prettierrc.json"))}"),
};`;
}
