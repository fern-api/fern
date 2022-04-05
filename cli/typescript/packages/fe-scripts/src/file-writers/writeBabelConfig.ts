import { createFileWriter } from "./utils/createFileWriter";

export const writeBabelConfig = createFileWriter({
    relativePath: "babel.config.js",
    isForBundlesOnly: false,
    generateFile: generateBabelConfig,
});

function generateBabelConfig(): string {
    return `module.exports = {
    presets: [["@babel/preset-env", { targets: { node: "current" } }], "@babel/preset-typescript"],
};`;
}
