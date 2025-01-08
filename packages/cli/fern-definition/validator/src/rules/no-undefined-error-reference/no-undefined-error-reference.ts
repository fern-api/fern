import { mapValues } from "lodash-es";

import { FernWorkspace, visitAllDefinitionFiles } from "@fern-api/api-workspace-commons";
import { DefinitionFileSchema, RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { parseReferenceToTypeName } from "@fern-api/ir-generator";

import { Rule, RuleViolation } from "../../Rule";
import { visitDefinitionFileYamlAst } from "../../ast";

type ErrorName = string;

export const NoUndefinedErrorReferenceRule: Rule = {
    name: "no-undefined-error-reference",
    create: ({ workspace }) => {
        const errorsByFilepath: Record<RelativeFilePath, Set<ErrorName>> = getErrorsByFilepath(workspace);

        function doesErrorExist(errorName: string, relativeFilepath: RelativeFilePath) {
            const errorsForFilepath = errorsByFilepath[relativeFilepath];
            if (errorsForFilepath == null) {
                return false;
            }
            return errorsForFilepath.has(errorName);
        }

        const validateErrorReference = (
            errorReference: string,
            relativeFilepath: RelativeFilePath,
            contents: DefinitionFileSchema | RootApiFileSchema
        ): RuleViolation[] => {
            const parsedReference = parseReferenceToTypeName({
                reference: errorReference,
                referencedIn: relativeFilepath,
                imports: mapValues(contents.imports ?? {}, RelativeFilePath.of)
            });

            if (parsedReference != null && doesErrorExist(parsedReference.typeName, parsedReference.relativeFilepath)) {
                return [];
            }

            return [
                {
                    severity: "error",
                    message: "Error is not defined."
                }
            ];
        };

        return {
            rootApiFile: {
                errorReference: (errorReference, { relativeFilepath, contents }) => {
                    return validateErrorReference(errorReference, relativeFilepath, contents);
                }
            },
            definitionFile: {
                errorReference: (errorReference, { relativeFilepath, contents }) => {
                    return validateErrorReference(errorReference, relativeFilepath, contents);
                }
            }
        };
    }
};

function getErrorsByFilepath(workspace: FernWorkspace) {
    const erorrsByFilepath: Record<RelativeFilePath, Set<ErrorName>> = {};

    visitAllDefinitionFiles(workspace, (relativeFilepath, file) => {
        const errorsForFile = new Set<ErrorName>();
        erorrsByFilepath[relativeFilepath] = errorsForFile;

        visitDefinitionFileYamlAst(file, {
            errorDeclaration: ({ errorName }) => {
                errorsForFile.add(errorName);
            }
        });
    });

    return erorrsByFilepath;
}
