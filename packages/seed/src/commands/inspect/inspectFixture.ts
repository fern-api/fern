import { AbstractAPIWorkspace, BaseOpenAPIWorkspace, FernDefinition } from "@fern-api/api-workspace-commons";
import { APIS_DIRECTORY, DEFINITION_DIRECTORY, FERN_DIRECTORY, ROOT_API_FILENAME } from "@fern-api/configuration";
import { AbsoluteFilePath, dirname, join, RelativeFilePath, streamObjectToFile } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { LogLevel } from "@fern-api/logger";
import { SourceResolver } from "@fern-api/source-resolver";
import { TaskContext } from "@fern-api/task-context";
import { mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import tmp from "tmp-promise";
import { convertGeneratorWorkspaceToFernWorkspace } from "../../utils/convertSeedWorkspaceToFernWorkspace.js";
import { TaskContextFactory } from "../test/TaskContextFactory.js";

export async function inspectFixture({
    fixture,
    outputPath,
    direct,
    logLevel
}: {
    fixture: string;
    outputPath: AbsoluteFilePath | undefined;
    direct: boolean;
    logLevel: LogLevel;
}): Promise<void> {
    const basePath = path.join(__dirname, "../../../test-definitions", FERN_DIRECTORY, APIS_DIRECTORY);
    const joinedPath = path.join(basePath, fixture);
    // Prevent path traversal: ensure the resolved path stays within test-definitions
    if (!path.resolve(joinedPath).startsWith(path.resolve(basePath) + path.sep)) {
        throw new Error(`Invalid fixture name: "${fixture}" resolves outside the test-definitions directory`);
    }
    const absolutePathToApiDefinition = AbsoluteFilePath.of(joinedPath);

    const resolvedOutputPath = outputPath ?? AbsoluteFilePath.of((await tmp.dir()).path);
    await mkdir(resolvedOutputPath, { recursive: true });

    const taskContextFactory = new TaskContextFactory(logLevel);
    const taskContext = taskContextFactory.create(`inspect:${fixture}`);

    taskContext.logger.info(`Inspecting fixture: ${fixture}`);
    taskContext.logger.info(`Output directory: ${resolvedOutputPath}`);

    const apiWorkspace = await convertGeneratorWorkspaceToFernWorkspace({
        fixture,
        absolutePathToAPIDefinition: absolutePathToApiDefinition,
        taskContext
    });

    if (apiWorkspace == null) {
        throw new Error(`Failed to load workspace for fixture: ${fixture}`);
    }

    if (direct) {
        await runDirectPath({ workspace: apiWorkspace, outputPath: resolvedOutputPath, taskContext });
    } else {
        await runStandardPath({ workspace: apiWorkspace, outputPath: resolvedOutputPath, taskContext });
    }

    taskContext.logger.info(`Done. Results in ${resolvedOutputPath}`);
}

async function runDirectPath({
    workspace,
    outputPath,
    taskContext
}: {
    workspace: AbstractAPIWorkspace<unknown>;
    outputPath: AbsoluteFilePath;
    taskContext: TaskContext;
}): Promise<void> {
    if (!(workspace instanceof OSSWorkspace)) {
        throw new Error(
            "The --direct flag requires an OpenAPI-backed fixture. This fixture uses Fern definitions directly."
        );
    }

    taskContext.logger.info("Running direct path: OpenAPI → IR (via @fern-api/openapi-to-ir)");

    const ir = await workspace.getIntermediateRepresentation({
        context: taskContext,
        audiences: { type: "all" },
        enableUniqueErrorsPerEndpoint: true,
        generateV1Examples: false,
        logWarnings: true
    });

    const irPath = join(outputPath, RelativeFilePath.of("ir-direct.json"));
    await streamObjectToFile(irPath, ir, { pretty: true });
    taskContext.logger.info(`Wrote direct IR to ${irPath}`);
}

async function runStandardPath({
    workspace,
    outputPath,
    taskContext
}: {
    workspace: AbstractAPIWorkspace<unknown>;
    outputPath: AbsoluteFilePath;
    taskContext: TaskContext;
}): Promise<void> {
    const isOpenAPIBacked = workspace instanceof BaseOpenAPIWorkspace;

    // Stage 1: OpenAPI IR (only for OpenAPI-backed fixtures)
    if (isOpenAPIBacked) {
        taskContext.logger.info("Stage 1: Generating OpenAPI IR (via @fern-api/openapi-ir-parser)");
        const openApiIr = await workspace.getOpenAPIIr({ context: taskContext });
        const openApiIrPath = join(outputPath, RelativeFilePath.of("openapi-ir.json"));
        await streamObjectToFile(openApiIrPath, openApiIr, { pretty: true });
        taskContext.logger.info(`Wrote OpenAPI IR to ${openApiIrPath}`);
    } else {
        taskContext.logger.info("Stage 1: Skipped (fixture is not OpenAPI-backed)");
    }

    // Stage 2: Fern definition (only for OpenAPI-backed fixtures)
    if (isOpenAPIBacked) {
        taskContext.logger.info("Stage 2: Generating Fern definition (via @fern-api/openapi-ir-to-fern)");
        const definition = await workspace.getDefinition({ context: taskContext });
        const definitionPath = join(outputPath, RelativeFilePath.of(DEFINITION_DIRECTORY));
        await writeFernDefinition({ definition, absolutePathToOutputDirectory: definitionPath });
        taskContext.logger.info(`Wrote Fern definition to ${definitionPath}`);
    } else {
        taskContext.logger.info("Stage 2: Skipped (fixture is not OpenAPI-backed)");
    }

    // Stage 3: Fern IR (always runs)
    taskContext.logger.info("Stage 3: Generating Fern IR (via @fern-api/ir-generator)");
    const fernWorkspace = await workspace.toFernWorkspace({ context: taskContext });

    const noopSourceResolver: SourceResolver = {
        resolveSource: () => undefined,
        resolveSourceOrThrow: () => undefined
    };

    const ir = generateIntermediateRepresentation({
        workspace: fernWorkspace,
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: false,
        exampleGeneration: { disabled: false },
        audiences: { type: "all" },
        readme: undefined,
        packageName: undefined,
        version: undefined,
        context: taskContext,
        sourceResolver: noopSourceResolver
    });

    const irPath = join(outputPath, RelativeFilePath.of("ir.json"));
    await streamObjectToFile(irPath, ir, { pretty: true });
    taskContext.logger.info(`Wrote Fern IR to ${irPath}`);
}

async function writeFernDefinition({
    definition,
    absolutePathToOutputDirectory
}: {
    definition: FernDefinition;
    absolutePathToOutputDirectory: AbsoluteFilePath;
}): Promise<void> {
    const sortKeys = (a: string, b: string): number => {
        const customOrder: Record<string, number> = {
            imports: 0,
            types: 1,
            services: 2
        };

        const orderA = a in customOrder ? customOrder[a] : Object.keys(customOrder).length;
        const orderB = b in customOrder ? customOrder[b] : Object.keys(customOrder).length;

        if (orderA !== orderB) {
            return (orderA ?? 0) - (orderB ?? 0);
        }

        return a.localeCompare(b);
    };

    await mkdir(absolutePathToOutputDirectory, { recursive: true });

    // Write api.yml
    await writeFile(
        join(absolutePathToOutputDirectory, RelativeFilePath.of(ROOT_API_FILENAME)),
        yaml.dump(definition.rootApiFile.contents, { sortKeys })
    );

    // Write __package__.yml files
    for (const [relativePath, packageMarker] of Object.entries(definition.packageMarkers)) {
        const absoluteFilepath = join(absolutePathToOutputDirectory, RelativeFilePath.of(relativePath));
        await mkdir(dirname(absoluteFilepath), { recursive: true });
        await writeFile(absoluteFilepath, yaml.dump(packageMarker.contents, { sortKeys }));
    }

    // Write named definition files
    for (const [relativePath, definitionFile] of Object.entries(definition.namedDefinitionFiles)) {
        const absoluteFilepath = join(absolutePathToOutputDirectory, RelativeFilePath.of(relativePath));
        await mkdir(dirname(absoluteFilepath), { recursive: true });
        await writeFile(absoluteFilepath, yaml.dump(definitionFile.contents, { sortKeys }));
    }
}
