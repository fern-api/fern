import path from "path";
import stylelint from "stylelint";
import { FileWriterArgs } from "./utils/createFileWriter";
import { createJsonFileWriter } from "./utils/createJsonFileWriter";
import { getPathToShared } from "./utils/getPathToShared";

export const writeStylelintRc = createJsonFileWriter({
    relativePath: ".stylelintrc.json",
    isForBundlesOnly: false,
    generateJson: generateStylelintRc,
});

function generateStylelintRc({ lernaPackage }: FileWriterArgs): stylelint.Config {
    const pathToShared = getPathToShared(lernaPackage);
    return {
        extends: [path.join(pathToShared, "stylelintrc.shared.json")],
    };
}
