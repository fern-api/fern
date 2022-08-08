import { RelativeFilePath } from "@fern-api/config-management-commons";
import path from "path";

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
        relativeFilePath: path.join(path.dirname(referencedIn), importPath) as RelativeFilePath,
        typeName: secondPart,
    };
}
