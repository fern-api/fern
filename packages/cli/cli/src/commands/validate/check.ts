import { DEFINITION_DIRECTORY, getFernDirectory, ROOT_API_FILENAME } from "@fern-api/configuration-loader";
import { ValidationViolation, validateFernWorkspace } from "@fern-api/fern-definition-validator";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { validateGeneratorsWorkspace } from "@fern-api/generators-validator";
import { LazyFernWorkspace, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { NOOP_LOGGER } from "@fern-api/logger";
import { validateOSSWorkspace } from "@fern-api/oss-validator";
import { loadProjectFromDirectory } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";

/**
 * Result of a single API validation
 */
export interface ApiCheckResult {
    /** Name of the API that was validated */
    apiName: string;
    /** List of validation violations found */
    violations: ValidationViolation[];
    /** Time taken to validate in milliseconds */
    elapsedMillis: number;
}

/**
 * Result of the check operation
 */
export interface CheckResult {
    /** Whether the check passed (no errors) */
    success: boolean;
    /** Results for each API workspace that was validated */
    apiResults: ApiCheckResult[];
    /** Total number of errors found */
    errorCount: number;
    /** Total number of warnings found */
    warningCount: number;
}

/**
 * Options for the check function
 */
export interface CheckOptions {
    /**
     * Path to the project directory containing the fern folder.
     * If not provided, will search for a fern directory from the current working directory.
     */
    directory?: string;

    /**
     * Name of a specific API workspace to validate.
     * If not provided, all API workspaces will be validated.
     */
    api?: string;
}

/**
 * Programmatically run `fern check` validation on a Fern project.
 *
 * This function validates the Fern definition files and returns structured results
 * instead of logging to the console or exiting the process.
 *
 * @example
 * ```typescript
 * import { check } from "fern-api";
 *
 * const result = await check({ directory: "/path/to/project" });
 *
 * if (!result.success) {
 *   console.log(`Found ${result.errorCount} errors`);
 *   for (const apiResult of result.apiResults) {
 *     for (const violation of apiResult.violations) {
 *       console.log(`${violation.severity}: ${violation.message}`);
 *     }
 *   }
 * }
 * ```
 *
 * @param options - Configuration options for the check
 * @returns A promise that resolves to the check result
 */
export async function check(options: CheckOptions = {}): Promise<CheckResult> {
    const { directory, api } = options;

    // Use NOOP_LOGGER for silent operation - violations are returned in the result
    const logger = NOOP_LOGGER;
    const context = createMockTaskContext({ logger });

    // Find the fern directory
    let fernDirectory: AbsoluteFilePath;
    if (directory != null) {
        const absolutePath = AbsoluteFilePath.of(directory);
        const fernSubdir = join(absolutePath, RelativeFilePath.of("fern"));
        if (await doesPathExist(fernSubdir)) {
            fernDirectory = fernSubdir;
        } else if (await doesPathExist(absolutePath)) {
            // Assume the directory itself is the fern directory
            fernDirectory = absolutePath;
        } else {
            return {
                success: false,
                apiResults: [],
                errorCount: 1,
                warningCount: 0
            };
        }
    } else {
        const foundFernDirectory = await getFernDirectory();
        if (foundFernDirectory == null) {
            return {
                success: false,
                apiResults: [],
                errorCount: 1,
                warningCount: 0
            };
        }
        fernDirectory = foundFernDirectory;
    }

    // Load the project
    let project;
    try {
        project = await loadProjectFromDirectory({
            absolutePathToFernDirectory: fernDirectory,
            cliName: "fern",
            cliVersion: "0.0.0",
            commandLineApiWorkspace: api,
            defaultToAllApiWorkspaces: true,
            context
        });
    } catch {
        return {
            success: false,
            apiResults: [],
            errorCount: 1,
            warningCount: 0
        };
    }

    const apiResults: ApiCheckResult[] = [];

    // Validate each API workspace
    for (const workspace of project.apiWorkspaces) {
        // Skip workspaces with no generators configured (unless they're fern workspaces)
        if (workspace.generatorsConfiguration?.groups.length === 0 && workspace.type !== "fern") {
            continue;
        }

        // For LazyFernWorkspace, check if api.yml exists
        if (workspace instanceof LazyFernWorkspace) {
            const absolutePathToApiYml = join(
                workspace.absoluteFilePath,
                RelativeFilePath.of(DEFINITION_DIRECTORY),
                RelativeFilePath.of(ROOT_API_FILENAME)
            );
            const apiYmlExists = await doesPathExist(absolutePathToApiYml);
            if (!apiYmlExists) {
                apiResults.push({
                    apiName: workspace.workspaceName ?? "api",
                    violations: [
                        {
                            severity: "error",
                            relativeFilepath: RelativeFilePath.of(ROOT_API_FILENAME),
                            nodePath: [],
                            message: `Missing file: ${ROOT_API_FILENAME}`
                        }
                    ],
                    elapsedMillis: 0
                });
                continue;
            }
        }

        try {
            const startTime = performance.now();
            const fernWorkspace = await workspace.toFernWorkspace({ context });

            // Run validation
            const apiViolations = validateFernWorkspace(fernWorkspace, logger);
            const generatorViolations = await validateGeneratorsWorkspace(fernWorkspace, logger);
            const violations = [...apiViolations, ...generatorViolations];

            // Add OSS workspace validation if applicable
            if (workspace instanceof OSSWorkspace) {
                violations.push(...(await validateOSSWorkspace(workspace, context)));
            }

            const elapsedMillis = performance.now() - startTime;

            apiResults.push({
                apiName: fernWorkspace.definition.rootApiFile.contents.name,
                violations,
                elapsedMillis
            });
        } catch {
            apiResults.push({
                apiName: workspace.workspaceName ?? "api",
                violations: [
                    {
                        severity: "error",
                        relativeFilepath: RelativeFilePath.of(""),
                        nodePath: [],
                        message: "Failed to load workspace"
                    }
                ],
                elapsedMillis: 0
            });
        }
    }

    // Calculate totals
    let errorCount = 0;
    let warningCount = 0;
    for (const result of apiResults) {
        for (const violation of result.violations) {
            if (violation.severity === "fatal" || violation.severity === "error") {
                errorCount++;
            } else if (violation.severity === "warning") {
                warningCount++;
            }
        }
    }

    return {
        success: errorCount === 0,
        apiResults,
        errorCount,
        warningCount
    };
}
