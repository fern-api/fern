import { dirname, join, RelativeFilePath } from "@fern-api/core-utils";

export interface ReferenceToTypeName {
    typeName: string;
    // if not defined, the reference lives in the same file as the referencer
    relativeFilePath: RelativeFilePath | undefined;
}

export function parseReferenceToTypeName({
    reference,
    referencedIn,
    imports,
}: {
    reference: string;
    referencedIn: RelativeFilePath;
    imports: Record<string, RelativeFilePath>;
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
        relativeFilePath: join(dirname(referencedIn), importPath),
        typeName: secondPart,
    };
}
