import path from "path";
import { SourceFile } from "ts-morph";

export function getRelativeModuleSpecifierTo(from: SourceFile | string, to: SourceFile | string): string {
    const parsedToFilePath = path.parse(typeof to === "string" ? to : to.getFilePath());
    const toFilePathWithoutExtension = path.join(parsedToFilePath.dir, parsedToFilePath.name);
    let moduleSpecifier = path.relative(
        path.dirname(typeof from === "string" ? from : from.getFilePath()),
        toFilePathWithoutExtension
    );
    if (!moduleSpecifier.startsWith(".")) {
        moduleSpecifier = `./${moduleSpecifier}`;
    }
    if (moduleSpecifier.endsWith("/")) {
        moduleSpecifier = moduleSpecifier.slice(0, -1);
    }
    return moduleSpecifier;
}
