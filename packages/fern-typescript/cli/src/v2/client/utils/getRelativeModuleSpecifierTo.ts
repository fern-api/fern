import path from "path";
import { SourceFile } from "ts-morph";

export function getRelativeModuleSpecifierTo(from: SourceFile | string, toFilePath: string): string {
    const parsedToFilePath = path.parse(toFilePath);
    const toFilePathWithoutExtension = path.join(parsedToFilePath.dir, parsedToFilePath.name);
    let moduleSpecifier = path.relative(
        path.dirname(typeof from === "string" ? from : from.getFilePath()),
        toFilePathWithoutExtension
    );
    if (!moduleSpecifier.startsWith(".")) {
        moduleSpecifier = `./${moduleSpecifier}`;
    }
    return moduleSpecifier;
}
