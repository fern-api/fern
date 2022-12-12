import { entries } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Workspace } from "@fern-api/workspace-loader";
import { visitFernServiceFileYamlAst } from "@fern-api/yaml-schema";
import path from "path";
import { Rule, RuleViolation } from "../../Rule";

type RelativeDirectoryPath = string;
type DeclaredName = string;

type Declarations = Record<RelativeDirectoryPath, Record<DeclaredName, RelativeFilePath[]>>;

export const NoDuplicateDeclarationsRule: Rule = {
    name: "no-duplicate-declarations",
    create: async ({ workspace, logger }) => {
        const declarations = await getDeclarations(workspace);

        const getRuleViolations = ({
            declaredName,
            relativeFilepath,
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

            const indexOfThisDeclarations = declarationsForName.indexOf(relativeFilepath);
            const duplicates = declarationsForName.filter((_declaration, index) => index !== indexOfThisDeclarations);
            return duplicates.map((duplicate) => ({
                severity: "error",
                message: `${declaredName} is already declared in ${
                    duplicate === relativeFilepath ? "this file" : duplicate
                }`,
            }));
        };

        return {
            serviceFile: {
                typeName: (typeName, { relativeFilepath }) =>
                    getRuleViolations({ declaredName: typeName, relativeFilepath }),
                errorDeclaration: ({ errorName }, { relativeFilepath }) =>
                    getRuleViolations({ declaredName: errorName, relativeFilepath }),
                httpService: ({ serviceName }, { relativeFilepath }) =>
                    getRuleViolations({ declaredName: serviceName, relativeFilepath }),
            },
        };
    },
};

async function getDeclarations(workspace: Workspace): Promise<Declarations> {
    const declarations: Declarations = {};

    for (const [relativeFilepath, file] of entries(workspace.serviceFiles)) {
        const relativeDirectoryPath: RelativeDirectoryPath = path.dirname(relativeFilepath);

        const declarationsForDirectory = (declarations[relativeDirectoryPath] ??= {});
        const addDeclaration = (declaredName: DeclaredName) => {
            (declarationsForDirectory[declaredName] ??= []).push(relativeFilepath);
        };

        await visitFernServiceFileYamlAst(file, {
            typeName: (typeName) => {
                addDeclaration(typeName);
            },
            errorDeclaration: ({ errorName }) => {
                addDeclaration(errorName);
            },
            httpService: ({ serviceName }) => {
                addDeclaration(serviceName);
            },
            httpEndpoint: ({ endpoint }) => {
                if (typeof endpoint.request !== "string" && endpoint.request?.name != null) {
                    addDeclaration(endpoint.request.name);
                }
            },
        });
    }

    return declarations;
}
