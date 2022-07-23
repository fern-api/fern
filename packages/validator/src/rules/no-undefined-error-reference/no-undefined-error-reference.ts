import { parseReferenceToTypeName } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-parser";
import { visitFernYamlAst } from "@fern-api/yaml-schema";
import path from "path";
import { Rule } from "../../Rule";

export const NoUndefinedErrorReferenceRule: Rule = {
    name: "no-undefined-type-reference",
    create: async ({ workspace }) => {
        const errorsByFilepath = await getErrorsByFilepath(workspace);

        function doesErrorExist(errorName: string, relativeFilePath: string) {
            const errorsForFilepath = errorsByFilepath[relativeFilePath];
            if (errorsForFilepath == null) {
                return false;
            }
            return errorsForFilepath.has(errorName);
        }

        return {
            errorReference: (errorReference, { relativeFilePath, contents }) => {
                const parsedReference = parseReferenceToTypeName({
                    reference: errorReference,
                    relativeFilePathOfDirectory: path.dirname(relativeFilePath),
                    imports: contents.imports ?? {},
                });

                if (
                    parsedReference != null &&
                    doesErrorExist(parsedReference.typeName, parsedReference.relativeFilePath ?? relativeFilePath)
                ) {
                    return [];
                }

                return [
                    {
                        severity: "error",
                        message: "Error is not defined.",
                    },
                ];
            },
        };
    },
};

async function getErrorsByFilepath(workspace: Workspace) {
    const erorrsByFilepath: Record<string, Set<string>> = {};

    for (const [relativeFilepath, file] of Object.entries(workspace.files)) {
        const errorsForFile = new Set<string>();
        erorrsByFilepath[relativeFilepath] = errorsForFile;

        await visitFernYamlAst(file, {
            errorDeclaration: ({ errorName }) => {
                errorsForFile.add(errorName);
            },
        });
    }

    return erorrsByFilepath;
}
