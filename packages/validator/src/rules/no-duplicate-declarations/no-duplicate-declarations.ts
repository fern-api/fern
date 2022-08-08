import { Workspace } from "@fern-api/workspace-loader";
import { visitFernYamlAst } from "@fern-api/yaml-schema";
import path from "path";
import { Rule, RuleViolation } from "../../Rule";

type RelativeDirectoryPath = string;
type DeclaredName = string;
type RelativeFilePath = string;

type Declarations = Record<RelativeDirectoryPath, Record<DeclaredName, RelativeFilePath[]>>;

export const NoDuplicateDeclarationsRule: Rule = {
    name: "no-duplicate-declarations",
    create: async ({ workspace }) => {
        const declarations = await getDeclarations(workspace);

        const getRuleViolations = ({
            declaredName,
            relativeFilePath,
        }: {
            declaredName: DeclaredName;
            relativeFilePath: RelativeFilePath;
        }): RuleViolation[] => {
            const relativeDirectoryPath: RelativeDirectoryPath = path.dirname(relativeFilePath);
            const declarationsForName = declarations[relativeDirectoryPath]?.[declaredName];
            if (declarationsForName == null) {
                throw new Error(
                    `Could not find declarations for name: ${declaredName}. This is an error in the Fern validator.`
                );
            }

            const indexOfThisDeclarations = declarationsForName.indexOf(relativeFilePath);
            const duplicates = declarationsForName.filter((_declaration, index) => index !== indexOfThisDeclarations);
            return duplicates.map((duplicate) => ({
                severity: "error",
                message: `${declaredName} is already declared in ${
                    duplicate === relativeFilePath ? "this file" : duplicate
                }`,
            }));
        };

        return {
            typeName: (typeName, { relativeFilePath }) =>
                getRuleViolations({ declaredName: typeName, relativeFilePath }),
            errorDeclaration: ({ errorName }, { relativeFilePath }) =>
                getRuleViolations({ declaredName: errorName, relativeFilePath }),
            httpService: ({ serviceName }, { relativeFilePath }) =>
                getRuleViolations({ declaredName: serviceName, relativeFilePath }),
        };
    },
};

async function getDeclarations(workspace: Workspace): Promise<Declarations> {
    const declarations: Declarations = {};

    for (const [relativeFilepath, file] of Object.entries(workspace.files)) {
        const relativeDirectoryPath: RelativeDirectoryPath = path.dirname(relativeFilepath);

        const declarationsForDirectory = (declarations[relativeDirectoryPath] ??= {});
        const addDeclaration = (declaredName: DeclaredName) => {
            (declarationsForDirectory[declaredName] ??= []).push(relativeFilepath);
        };

        await visitFernYamlAst(file, {
            typeName: (typeName) => {
                addDeclaration(typeName);
            },
            errorDeclaration: ({ errorName }) => {
                addDeclaration(errorName);
            },
            httpService: ({ serviceName }) => {
                addDeclaration(serviceName);
            },
        });
    }

    return declarations;
}
