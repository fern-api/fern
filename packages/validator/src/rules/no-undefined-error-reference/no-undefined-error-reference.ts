import { parseReferenceToTypeName } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-parser";
import { visitFernYamlAst } from "@fern-api/yaml-schema";
import chalk from "chalk";
import path from "path";
import { Rule, RuleViolation } from "../../Rule";

export const NoUndefinedErrorReferenceRule: Rule = {
    name: "no-undefined-type-reference",
    create: async ({ workspace }) => {
        const errorsByFilepath = await getErrorsByFilepath(workspace);

        function doesErrorExist(reference: ReferenceToErrorName) {
            if (reference.parsed == null) {
                return false;
            }
            const errorsForFilepath = errorsByFilepath[reference.parsed.relativeFilePath];
            if (errorsForFilepath == null) {
                return false;
            }
            return errorsForFilepath.has(reference.parsed.errorName);
        }

        return {
            errorReference: (errorReference, { relativeFilePath, contents }) => {
                const namedErrors = getAllNamedErrors(errorReference, relativeFilePath, contents.imports ?? {});

                return namedErrors.reduce<RuleViolation[]>((violations, namedType) => {
                    if (!doesErrorExist(namedType)) {
                        violations.push({
                            severity: "error",
                            message: `Error ${chalk.bold(namedType.fullyQualifiedName)} is not defined.`,
                        });
                    }

                    return violations;
                }, []);
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

interface ReferenceToErrorName {
    fullyQualifiedName: string;
    parsed:
        | {
              errorName: string;
              relativeFilePath: string;
          }
        | undefined;
}

function getAllNamedErrors(
    errorName: string,
    relativeFilePath: string,
    imports: Record<string, string>
): ReferenceToErrorName[] {
    const reference = parseReferenceToTypeName({
        reference: errorName,
        relativeFilePathOfDirectory: path.dirname(relativeFilePath),
        imports,
    });
    return [
        {
            fullyQualifiedName: errorName,
            parsed:
                reference != null
                    ? {
                          errorName: reference.typeName,
                          relativeFilePath: reference.relativeFilePath ?? relativeFilePath,
                      }
                    : undefined,
        },
    ];
}
