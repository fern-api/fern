import path from "path";

export interface ReferenceToTypeName {
    typeName: string;
    // if not defined, the reference lives in the same file as the referencer
    relativeFilePath: string | undefined;
}

export function parseReferenceToTypeName({
    reference,
    relativeFilePathOfDirectory,
    imports,
}: {
    reference: string;
    relativeFilePathOfDirectory: string;
    imports: Record<string, string>;
}): ReferenceToTypeName | undefined {
    const [firstPart, secondPart, ...rest] = reference.split(".");

    if (firstPart == null || rest.length > 0) {
        return undefined;
    }

    if (secondPart == null) {
        return {
            typeName: firstPart,
            relativeFilePath: undefined,
        };
    }

    const importAlias = firstPart;
    const importPath = imports[importAlias];
    if (importPath == null) {
        return undefined;
    }

    return {
        relativeFilePath: path.join(relativeFilePathOfDirectory, importPath),
        typeName: secondPart,
    };
}
