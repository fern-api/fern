import { Workspace } from "@fern-api/workspace-parser";
import path from "path";
import { visitAst } from "../ast/visitAst";
import { Rule } from "../Rule";

export const NoUndefinedTypeReferenceRule: Rule = {
    name: "no-undefined-type-reference",
    create: ({ workspace }) => {
        const typesByFilepath = getTypesByFilepath(workspace);

        return {
            typeReference: (typeReference, { relativeFilePath }) => {
                const typesForFilepath = typesByFilepath[path.normalize(relativeFilePath)];
                if (typesForFilepath == null) {
                    throw new Error("Encounted unexpected file: " + relativeFilePath);
                }

                const type = typeof typeReference === "string" ? typeReference : typeReference.type;
                if (typesForFilepath.has(type)) {
                    return [];
                } else {
                    // TODO report error
                    return [];
                }
            },
        };
    },
};

function getTypesByFilepath(workspace: Workspace) {
    const typesByFilepath: Record<string, Set<string>> = {};

    for (const [relativeFilepath, file] of Object.entries(workspace.files)) {
        const typesForFile = new Set<string>();
        typesByFilepath[path.normalize(relativeFilepath)] = typesForFile;

        visitAst(file, {
            typeDeclaration: ({ typeName }) => {
                typesForFile.add(typeName);
            },
        });
    }

    return typesByFilepath;
}
