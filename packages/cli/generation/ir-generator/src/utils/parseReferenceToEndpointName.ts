import { RelativeFilePath } from "@fern-api/path-utils";

import { getResolvedPathOfImportedFile } from "./getResolvedPathOfImportedFile";

export interface ReferenceToEndpointName {
    endpointName: string;
    relativeFilepath: RelativeFilePath;
}

export function parseReferenceToEndpointName({
    reference,
    referencedIn,
    imports
}: {
    reference: string;
    referencedIn: RelativeFilePath;
    imports: Record<string, RelativeFilePath>;
}): ReferenceToEndpointName | undefined {
    const [firstPart, secondPart, ...rest] = reference.split(".");

    if (firstPart == null || rest.length > 0) {
        return undefined;
    }

    if (secondPart == null) {
        return {
            endpointName: firstPart,
            relativeFilepath: referencedIn
        };
    }

    const importAlias = firstPart;
    const importPath = imports[importAlias];
    if (importPath == null) {
        return undefined;
    }

    return {
        endpointName: secondPart,
        relativeFilepath: getResolvedPathOfImportedFile({ referencedIn, importPath })
    };
}
