import { keys } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { getResolvedPathOfImportedFile } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { Rule } from "../../Rule";

type CircularImports = Record<RelativeFilePath, CircularImport[]>;

interface CircularImport {
    startingFilepath: RelativeFilePath;
    chainWithoutStartingFilepath: RelativeFilePath[];
}

export const NoCircularImportsRule: Rule = {
    name: "no-circular-imports",
    DISABLE_RULE: true,
    create: ({ workspace }) => {
        const circularImports = findCircularImports(workspace.serviceFiles);

        return {
            serviceFile: {
                import: async ({ importPath }, { relativeFilepath }) => {
                    const circularImportsForFile = circularImports[relativeFilepath];
                    if (circularImportsForFile == null) {
                        return [];
                    }

                    const resolvedImportPath = getResolvedPathOfImportedFile({
                        referencedIn: relativeFilepath,
                        importPath: RelativeFilePath.of(importPath),
                    });
                    const circularImportsToReport = circularImportsForFile.filter(
                        ({ chainWithoutStartingFilepath: chain }) =>
                            chain.length === 0 || chain[0] === resolvedImportPath
                    );

                    return circularImportsToReport.map((circularImport) => ({
                        severity: "error",
                        message:
                            circularImport.chainWithoutStartingFilepath.length === 0
                                ? "A file cannot import itself"
                                : `Circular import detected: ${[
                                      circularImport.startingFilepath,
                                      ...circularImport.chainWithoutStartingFilepath,
                                      circularImport.startingFilepath,
                                  ].join(" -> ")}`,
                    }));
                },
            },
        };
    },
};

function findCircularImports(serviceFiles: Workspace["serviceFiles"]): CircularImports {
    const circularImports: CircularImports = {};

    for (const filepath of keys(serviceFiles)) {
        circularImports[filepath] = findCircularImportsRecursive(filepath, [filepath], serviceFiles);
    }

    return circularImports;
}

function findCircularImportsRecursive(
    filepath: RelativeFilePath,
    path: RelativeFilePath[],
    serviceFiles: Workspace["serviceFiles"]
): CircularImport[] {
    const circularImports: CircularImport[] = [];

    const file = serviceFiles[filepath];
    if (file == null) {
        // import points to a file that doesn't exist.
        // this will be flagged by the import-file-exists rule
        return [];
    }

    if (file.contents.imports != null) {
        for (const importPath of Object.values(file.contents.imports)) {
            const resolvedImportPath = getResolvedPathOfImportedFile({
                referencedIn: filepath,
                importPath: RelativeFilePath.of(importPath),
            });
            if (path.includes(resolvedImportPath)) {
                // to reduce duplicates, only keep track of paths that:
                //   - start and end with the same relative file path
                //   - start with the "minimum" relative file path (when sorting alphabetically)
                if (path[0] === resolvedImportPath && path[0] === minimumString(path)) {
                    circularImports.push({
                        startingFilepath: resolvedImportPath,
                        chainWithoutStartingFilepath: path.slice(1),
                    });
                }
            } else {
                circularImports.push(
                    ...findCircularImportsRecursive(resolvedImportPath, [...path, resolvedImportPath], serviceFiles)
                );
            }
        }
    }

    return circularImports;
}

function minimumString(strings: readonly string[]): string | undefined {
    return strings.reduce((minimum, str) => (str < minimum ? str : minimum));
}
