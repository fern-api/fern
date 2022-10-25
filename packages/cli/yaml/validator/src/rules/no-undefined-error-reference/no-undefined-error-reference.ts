import { entries, RelativeFilePath } from "@fern-api/core-utils";
import { parseReferenceToTypeName } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { visitFernServiceFileYamlAst } from "@fern-api/yaml-schema";
import { mapValues } from "lodash-es";
import { Rule } from "../../Rule";

type ErrorName = string;

export const NoUndefinedErrorReferenceRule: Rule = {
    name: "no-undefined-error-reference",
    create: async ({ workspace }) => {
        const errorsByFilepath: Record<RelativeFilePath, Set<ErrorName>> = await getErrorsByFilepath(workspace);

        function doesErrorExist(errorName: string, relativeFilepath: RelativeFilePath) {
            const errorsForFilepath = errorsByFilepath[relativeFilepath];
            if (errorsForFilepath == null) {
                return false;
            }
            return errorsForFilepath.has(errorName);
        }

        return {
            serviceFile: {
                errorReference: (errorReference, { relativeFilepath, contents }) => {
                    const parsedReference = parseReferenceToTypeName({
                        reference: errorReference,
                        referencedIn: relativeFilepath,
                        imports: mapValues(contents.imports ?? {}, RelativeFilePath.of),
                    });

                    if (
                        parsedReference != null &&
                        doesErrorExist(parsedReference.typeName, parsedReference.relativeFilepath)
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
            },
        };
    },
};

async function getErrorsByFilepath(workspace: Workspace) {
    const erorrsByFilepath: Record<RelativeFilePath, Set<ErrorName>> = {};

    for (const [relativeFilepath, file] of entries(workspace.serviceFiles)) {
        const errorsForFile = new Set<ErrorName>();
        erorrsByFilepath[relativeFilepath] = errorsForFile;

        await visitFernServiceFileYamlAst(file, {
            errorDeclaration: ({ errorName }) => {
                errorsForFile.add(errorName);
            },
        });
    }

    return erorrsByFilepath;
}
