import { entries, RelativeFilePath } from "@fern-api/core-utils";
import { parseReferenceToTypeName } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { visitFernYamlAst } from "@fern-api/yaml-schema";
import { Rule } from "../../Rule";

type ErrorName = string;

export const NoUndefinedErrorReferenceRule: Rule = {
    name: "no-undefined-error-reference",
    create: async ({ workspace }) => {
        const errorsByFilepath: Record<RelativeFilePath, Set<ErrorName>> = await getErrorsByFilepath(workspace);

        function doesErrorExist(errorName: string, relativeFilePath: RelativeFilePath) {
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
                    referencedIn: relativeFilePath,
                    imports: contents.imports ?? {},
                });

                if (
                    parsedReference != null &&
                    doesErrorExist(parsedReference.typeName, parsedReference.relativeFilePath)
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
    const erorrsByFilepath: Record<RelativeFilePath, Set<ErrorName>> = {};

    for (const [relativeFilepath, file] of entries(workspace.serviceFiles)) {
        const errorsForFile = new Set<ErrorName>();
        erorrsByFilepath[relativeFilepath] = errorsForFile;

        await visitFernYamlAst(file, {
            errorDeclaration: ({ errorName }) => {
                errorsForFile.add(errorName);
            },
        });
    }

    return erorrsByFilepath;
}
