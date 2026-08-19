import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { Audiences, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { INTERMEDIATE_REPRESENTATION_MIGRATOR } from "@fern-api/ir-migrations";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { createMockTaskContext, TaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

export interface CreateSampleIrOptions {
    workspaceName?: string;
    context?: TaskContext;
    cliVersion?: string;
    generationLanguage?: generatorsYml.GenerationLanguage;
    audiences?: Audiences;
    keywords?: string[];
    smartCasing?: boolean;
    exampleGeneration?: generateIntermediateRepresentation.Args["exampleGeneration"];
    readme?: generatorsYml.ReadmeSchema;
    version?: string;
    packageName?: string;
}

/**
 * Crawls up the directory tree from the given path to find the nearest package.json,
 * then extracts the major version of @fern-fern/ir-sdk and returns it as a version string (e.g. "v65").
 */
export async function getIrVersionFromPackageJson(startDir: string): Promise<string> {
    let dir = startDir;
    while (true) {
        const candidate = resolve(dir, "package.json");
        const exists = await access(candidate)
            .then(() => true)
            .catch(() => false);
        if (exists) {
            const packageJson = JSON.parse(await readFile(candidate, "utf-8")) as {
                devDependencies?: Record<string, string>;
                dependencies?: Record<string, string>;
            };
            const irSdkVersion =
                packageJson.devDependencies?.["@fern-fern/ir-sdk"] ?? packageJson.dependencies?.["@fern-fern/ir-sdk"];
            if (irSdkVersion != null) {
                const majorVersion = irSdkVersion.replace(/^\^|^~/, "").split(".")[0];
                if (majorVersion == null) {
                    throw new Error(`Could not parse major version from @fern-fern/ir-sdk version: ${irSdkVersion}`);
                }
                return `v${majorVersion}`;
            }
        }
        const parent = dirname(dir);
        if (parent === dir) {
            throw new Error(
                `Could not find a package.json with @fern-fern/ir-sdk in devDependencies or dependencies starting from ${startDir}`
            );
        }
        dir = parent;
    }
}

/**
 * Loads the definition from the specified directory and creates a sample IR for testing purposes.
 */
export async function createSampleIr(
    absolutePathToWorkspace: string | AbsoluteFilePath,
    opts?: CreateSampleIrOptions
): Promise<IntermediateRepresentation> {
    const pathToWorkspace =
        typeof absolutePathToWorkspace === "string"
            ? AbsoluteFilePath.of(absolutePathToWorkspace)
            : absolutePathToWorkspace;
    const workspaceName = opts?.workspaceName ?? "Test Workspace";
    const context = opts?.context ?? createMockTaskContext();
    const cliVersion = opts?.cliVersion ?? "0.0.0";

    const generationLanguage = opts?.generationLanguage;
    const audiences = opts?.audiences ?? { type: "all" };
    const keywords = opts?.keywords;
    const smartCasing = opts?.smartCasing ?? true;
    const exampleGeneration = opts?.exampleGeneration ?? { disabled: true };
    const readme = opts?.readme;
    const version = opts?.version;
    const packageName = opts?.packageName;

    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: pathToWorkspace,
        context,
        cliVersion,
        workspaceName
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load workspace '${pathToWorkspace}'`);
    }
    const fernWorkspace = await workspace.workspace.toFernWorkspace({ context });
    return generateIntermediateRepresentation({
        workspace: fernWorkspace,
        generationLanguage,
        audiences,
        keywords,
        smartCasing,
        exampleGeneration,
        readme,
        version,
        packageName,
        context,
        sourceResolver: new SourceResolverImpl(context, fernWorkspace)
    });
}

/**
 * Creates a sample IR and migrates it to the specified IR version.
 * Use this when testing generators that consume an older IR version.
 * For example, generators on v65 IR should call:
 *   createMigratedSampleIr(path, "v65", opts)
 */
export async function createMigratedSampleIr<T = unknown>(
    absolutePathToWorkspace: string | AbsoluteFilePath,
    targetIrVersion: string,
    opts?: CreateSampleIrOptions
): Promise<T> {
    const ir = await createSampleIr(absolutePathToWorkspace, opts);
    const context = opts?.context ?? createMockTaskContext();
    const migrated = INTERMEDIATE_REPRESENTATION_MIGRATOR.migrateThroughVersion<T>({
        version: targetIrVersion,
        intermediateRepresentation: ir,
        context
    });
    return migrated.ir;
}
