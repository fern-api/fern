import {
    ExitStatusUpdate,
    GeneratorNotificationService,
    GeneratorUpdate,
    parseGeneratorConfig,
    parseIR
} from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { copyFile, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { CLI_TEMPLATE } from "./templates/cli-template.js";

interface RawSpecsManifestEntry {
    type: "openapi" | "protobuf" | "openrpc" | "graphql";
    specPath: string;
    overridePaths?: string[];
    overlayPath?: string;
}

interface RawSpecsManifest {
    specs: RawSpecsManifestEntry[];
}

const RAW_SPECS_DIRECTORY = "/fern/raw-specs";
const RAW_SPECS_MANIFEST_FILENAME = "specs-manifest.json";

const pathToConfig = process.argv[process.argv.length - 1];
if (pathToConfig == null) {
    throw new Error("No argument for config filepath.");
}

void generate(pathToConfig);

async function generate(configPath: string): Promise<void> {
    try {
        const config = await parseGeneratorConfig(configPath);
        const generatorLoggingClient = new GeneratorNotificationService(config.environment);

        try {
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.init({
                    packagesToPublish: []
                })
            );

            const ir = await parseIR<FernIr.IntermediateRepresentation>({
                absolutePathToIR: AbsoluteFilePath.of(config.irFilepath),
                parse: IrSerialization.IntermediateRepresentation.parse
            });

            const outputDir = config.output.path;
            await mkdir(outputDir, { recursive: true });

            const apiName = typeof ir.apiName === "string" ? ir.apiName : ir.apiName.originalName;
            const rendered = CLI_TEMPLATE.replaceAll("{{apiName}}", apiName);
            await writeFile(path.join(outputDir, "cli.ts"), rendered);

            // Copy raw API spec files from the mounted directory to the output
            await copyRawSpecs(outputDir);

            await generatorLoggingClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful({})));
        } catch (e) {
            // biome-ignore lint/suspicious/noConsole: generator CLI output
            console.error("Generation failed:", e instanceof Error ? e.message : e);
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.exitStatusUpdate(
                    ExitStatusUpdate.error({
                        message: e instanceof Error ? e.message : "Encountered error"
                    })
                )
            );
        }
    } catch (e) {
        // biome-ignore lint/suspicious/noConsole: generator CLI output
        console.error("Encountered error", e);
        throw e;
    }
}

async function copyRawSpecs(outputDir: string): Promise<void> {
    const manifestPath = path.join(RAW_SPECS_DIRECTORY, RAW_SPECS_MANIFEST_FILENAME);
    let manifestContent: string;
    try {
        manifestContent = await readFile(manifestPath, "utf-8");
    } catch {
        // No manifest means no raw specs were mounted
        return;
    }

    const manifest: RawSpecsManifest = JSON.parse(manifestContent);
    if (manifest.specs.length === 0) {
        return;
    }

    const specsOutputDir = path.join(outputDir, "specs");
    await mkdir(specsOutputDir, { recursive: true });

    const copiedManifest: RawSpecsManifest = { specs: [] };

    for (const entry of manifest.specs) {
        const copiedEntry: RawSpecsManifestEntry = {
            type: entry.type,
            specPath: await copySpecFile(entry.specPath, specsOutputDir)
        };

        if (entry.overridePaths != null && entry.overridePaths.length > 0) {
            copiedEntry.overridePaths = [];
            for (const overridePath of entry.overridePaths) {
                copiedEntry.overridePaths.push(await copySpecFile(overridePath, specsOutputDir));
            }
        }

        if (entry.overlayPath != null) {
            copiedEntry.overlayPath = await copySpecFile(entry.overlayPath, specsOutputDir);
        }

        copiedManifest.specs.push(copiedEntry);
    }

    await writeFile(
        path.join(specsOutputDir, RAW_SPECS_MANIFEST_FILENAME),
        JSON.stringify(copiedManifest, undefined, 4)
    );
}

async function copySpecFile(containerPath: string, specsOutputDir: string): Promise<string> {
    const relativePath = containerPath.startsWith(RAW_SPECS_DIRECTORY + "/")
        ? containerPath.slice(RAW_SPECS_DIRECTORY.length + 1)
        : path.basename(containerPath);

    const destPath = path.join(specsOutputDir, relativePath);
    await mkdir(path.dirname(destPath), { recursive: true });
    await copyFile(containerPath, destPath);

    return relativePath;
}
