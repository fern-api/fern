import { createFileWriter } from "./utils/createFileWriter";

export const writeDeclarationsDTs = createFileWriter({
    relativePath: "src/declarations.d.ts",
    isForBundlesOnly: false,
    generateFile: generateDeclarationsDTs,
});

function generateDeclarationsDTs(): string {
    return `declare module "*.module.scss";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";`;
}
