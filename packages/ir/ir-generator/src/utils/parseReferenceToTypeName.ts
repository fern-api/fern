import path from "path";

export interface ReferenceToTypeName {
    referenceName: string;
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
}): ReferenceToTypeName {
    const [firstPart, secondPart, ...rest] = reference.split(".");

    if (firstPart == null || rest.length > 0) {
        throw new Error(`Invalid reference: ${reference}`);
    }

    if (secondPart == null) {
        return {
            referenceName: firstPart,
            relativeFilePath: undefined,
        };
    }

    const importAlias = firstPart;
    const importPath = imports[importAlias];
    if (importPath == null) {
        throw new Error(`Invalid reference: ${reference}. Package ${importAlias} not found.`);
    }

    return {
        relativeFilePath: path.join(relativeFilePathOfDirectory, importPath),
        referenceName: secondPart,
    };
}
