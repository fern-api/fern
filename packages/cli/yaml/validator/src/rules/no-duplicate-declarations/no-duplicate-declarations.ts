import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernWorkspace, visitAllDefinitionFiles } from "@fern-api/workspace-loader";
import { visitDefinitionFileYamlAst } from "@fern-api/yaml-schema";
import path from "path";
import { Rule, RuleViolation } from "../../Rule";

type RelativeDirectoryPath = string;
type DeclaredName = string;

type Declarations = Record<RelativeDirectoryPath, Record<DeclaredName, RelativeFilePath[]>>;

export const NoDuplicateDeclarationsRule: Rule = {
    name: "no-duplicate-declarations",
    create: async ({ workspace, logger }) => {
        const declarations = await getDeclarations(workspace);

        // keep track of seen types, so we only warn starting on the second instance
        const seenTypes: Record<RelativeDirectoryPath, Set<DeclaredName>> = {};

        const getRuleViolations = ({
            declaredName,
            relativeFilepath
        }: {
            declaredName: DeclaredName;
            relativeFilepath: RelativeFilePath;
        }): RuleViolation[] => {
            const relativeDirectoryPath: RelativeDirectoryPath = path.dirname(relativeFilepath);
            const declarationsForName = declarations[relativeDirectoryPath]?.[declaredName];
            if (declarationsForName == null) {
                logger.error(
                    `Could not find declarations for name: ${declaredName}. This is an error in the Fern validator.`
                );
                return [];
            }

            // only warn starting on the second instance
            const seenTypesForFilepath = (seenTypes[relativeDirectoryPath] ??= new Set());
            if (!seenTypesForFilepath.has(declaredName)) {
                seenTypesForFilepath.add(declaredName);
                return [];
            }

            const indexOfThisDeclarations = declarationsForName.indexOf(relativeFilepath);
            const duplicates = declarationsForName.filter((_declaration, index) => index !== indexOfThisDeclarations);
            return duplicates.map((duplicate) => ({
                severity: "error",
                message: `${declaredName} is already declared in ${
                    duplicate === relativeFilepath ? "this file" : duplicate
                }`
            }));
        };

        return {
            definitionFile: {
                typeName: (typeName, { relativeFilepath }) =>
                    getRuleViolations({ declaredName: typeName, relativeFilepath }),
                errorDeclaration: ({ errorName }, { relativeFilepath }) =>
                    getRuleViolations({ declaredName: errorName, relativeFilepath }),
                httpEndpoint: ({ endpoint }, { relativeFilepath }) => {
                    if (typeof endpoint.request !== "string" && endpoint.request?.name != null) {
                        return getRuleViolations({ declaredName: endpoint.request.name, relativeFilepath });
                    } else {
                        return [];
                    }
                }
            }
        };
    }
};

async function getDeclarations(workspace: FernWorkspace): Promise<Declarations> {
    const declarations: Declarations = {};

    await visitAllDefinitionFiles(workspace, async (relativeFilepath, file) => {
        const relativeDirectoryPath: RelativeDirectoryPath = path.dirname(relativeFilepath);

        const declarationsForDirectory = (declarations[relativeDirectoryPath] ??= {});
        const addDeclaration = (declaredName: DeclaredName) => {
            (declarationsForDirectory[declaredName] ??= []).push(relativeFilepath);
        };

        await visitDefinitionFileYamlAst(file, {
            typeName: (typeName) => {
                addDeclaration(typeName);
            },
            errorDeclaration: ({ errorName }) => {
                addDeclaration(errorName);
            },
            httpEndpoint: ({ endpoint }) => {
                if (typeof endpoint.request !== "string" && endpoint.request?.name != null) {
                    addDeclaration(endpoint.request.name);
                }
            }
        });
    });

    return declarations;
}
