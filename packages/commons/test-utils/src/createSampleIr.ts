import { constructFullCasingsGenerator } from "@fern-api/casings-generator";
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
    const casingsGenerator = constructFullCasingsGenerator({
        generationLanguage: opts?.generationLanguage,
        keywords: opts?.keywords,
        smartCasing: opts?.smartCasing ?? true
    });
    const migrated = INTERMEDIATE_REPRESENTATION_MIGRATOR.migrateThroughVersion<T>({
        version: targetIrVersion,
        intermediateRepresentation: ir,
        context,
        casingsGenerator
    });
    return migrated.ir;
}
