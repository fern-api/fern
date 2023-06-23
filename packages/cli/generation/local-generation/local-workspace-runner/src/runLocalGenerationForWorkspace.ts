import { Audiences } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, doesPathExist, streamObjectToFile } from "@fern-api/fs-utils";
import { GeneratorGroup, GeneratorInvocation } from "@fern-api/generators-configuration";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { migrateIntermediateRepresentationForGenerator } from "@fern-api/ir-migrations";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import decompress from "decompress";
import { cp, readFile, readdir, rm } from "fs/promises";
import os from "os";
import path, { join } from "path";
import tmp, { DirectoryResult } from "tmp-promise";
import { runGenerator } from "./run-generator/runGenerator";
import { globSync } from "glob";
import { promisify } from "util";
import { exec } from "child_process";

const EXEC = promisify(exec);

export async function runLocalGenerationForWorkspace({
    organization,
    workspace,
    generatorGroup,
    keepDocker,
    context,
}: {
    organization: string;
    workspace: FernWorkspace;
    generatorGroup: GeneratorGroup;
    keepDocker: boolean;
    context: TaskContext;
}): Promise<void> {
    const workspaceTempDir = await tmp.dir({
        // use the /private prefix on osx so that docker can access the tmpdir
        // see https://stackoverflow.com/a/45123074
        tmpdir: os.platform() === "darwin" ? path.join("/private", os.tmpdir()) : undefined,
        prefix: "fern",
    });

    const results = await Promise.all(
        generatorGroup.generators.map(async (generatorInvocation) => {
            return context.runInteractiveTask({ name: generatorInvocation.name }, async (interactiveTaskContext) => {
                if (generatorInvocation.absolutePathToLocalOutput == null) {
                    interactiveTaskContext.failWithoutThrowing(
                        "Cannot generate because output location is not local-file-system"
                    );
                } else {
                    await writeFilesToDiskAndRunGenerator({
                        organization,
                        workspace,
                        generatorInvocation,
                        absolutePathToLocalOutput: generatorInvocation.absolutePathToLocalOutput,
                        audiences: generatorGroup.audiences,
                        workspaceTempDir,
                        keepDocker,
                        context: interactiveTaskContext,
                    });
                    interactiveTaskContext.logger.info(
                        chalk.green("Wrote files to " + generatorInvocation.absolutePathToLocalOutput)
                    );
                }
            });
        })
    );

    if (results.some((didSucceed) => !didSucceed)) {
        context.failAndThrow();
    }
}

async function writeFilesToDiskAndRunGenerator({
    organization,
    workspace,
    generatorInvocation,
    absolutePathToLocalOutput,
    audiences,
    workspaceTempDir,
    keepDocker,
    context,
}: {
    organization: string;
    workspace: FernWorkspace;
    audiences: Audiences;
    generatorInvocation: GeneratorInvocation;
    absolutePathToLocalOutput: AbsoluteFilePath;
    workspaceTempDir: DirectoryResult;
    keepDocker: boolean;
    context: TaskContext;
}): Promise<void> {
    const absolutePathToIr = await writeIrToFile({
        workspace,
        audiences,
        generatorInvocation,
        workspaceTempDir,
        context,
    });
    context.logger.debug("Wrote IR to: " + absolutePathToIr);

    const configJsonFile = await tmp.file({
        tmpdir: workspaceTempDir.path,
    });
    const absolutePathToWriteConfigJson = AbsoluteFilePath.of(configJsonFile.path);
    context.logger.debug("Will write config.json to: " + absolutePathToWriteConfigJson);

    const tmpOutputDirectory = await tmp.dir({
        tmpdir: workspaceTempDir.path,
    });
    const absolutePathToTmpOutputDirectory = AbsoluteFilePath.of(tmpOutputDirectory.path);
    context.logger.debug("Will write output to: " + absolutePathToTmpOutputDirectory);

    await runGenerator({
        imageName: `${generatorInvocation.name}:${generatorInvocation.version}`,
        absolutePathToOutput: absolutePathToTmpOutputDirectory,
        absolutePathToIr,
        absolutePathToWriteConfigJson,
        customConfig: generatorInvocation.config,
        workspaceName: workspace.name,
        organization,
        keepDocker,
    });

    const [firstLocalOutputItem, ...remaininglocalOutputItems] = await readdir(absolutePathToTmpOutputDirectory);
    if (firstLocalOutputItem == null) {
        return;
    }
    // await rm(absolutePathToLocalOutput, { force: true, recursive: true });
    const absolutePathToFernignore = path.join(absolutePathToLocalOutput, ".fernignore");
    let filesToBeIgnoredByFern: string[] = [".fernignore"];
    const absolutePathToFernignoreExists = await doesPathExist(AbsoluteFilePath.of(absolutePathToFernignore));

    if (absolutePathToFernignoreExists) {
        const absolutePathToFernignoreContent = await readFile(absolutePathToFernignore, "utf-8");
        filesToBeIgnoredByFern = filesToBeIgnoredByFern.concat(absolutePathToFernignoreContent.trim().split(/\r?\n/));
        filesToBeIgnoredByFern = filesToBeIgnoredByFern.filter(filePattern => filePattern !== "" && !filePattern.startsWith("#"));
        filesToBeIgnoredByFern = globSync(filesToBeIgnoredByFern, {
            cwd: absolutePathToLocalOutput, root: "", dot: true, nobrace: false, noext: false, matchBase: true
        });
        await EXEC("git init", {cwd: absolutePathToLocalOutput});
        await EXEC("git add .", {cwd: absolutePathToLocalOutput});
        await EXEC("git commit -m \"initial\"", {cwd: absolutePathToLocalOutput});
        await EXEC("git rm -rf .", {cwd: absolutePathToLocalOutput});
    } else {
        await rm(absolutePathToLocalOutput, { force: true, recursive: true });
    }

    if (firstLocalOutputItem.endsWith(".zip") && remaininglocalOutputItems.length === 0) {
        await decompress(join(absolutePathToTmpOutputDirectory, firstLocalOutputItem), absolutePathToLocalOutput, {
            strip: 1,
        });
    } else {
        await cp(absolutePathToTmpOutputDirectory, absolutePathToLocalOutput, { recursive: true });
    }

    if (absolutePathToFernignoreExists) {
        await EXEC(`git reset -- ${filesToBeIgnoredByFern.join(" ")}`, {cwd: absolutePathToLocalOutput});
        await EXEC("git restore .", {cwd: absolutePathToLocalOutput});
        await rm(`${absolutePathToLocalOutput}${path.sep}.git`, { force: true, recursive: true});
    }

}

async function writeIrToFile({
    workspace,
    audiences,
    generatorInvocation,
    workspaceTempDir,
    context,
}: {
    workspace: FernWorkspace;
    audiences: Audiences;
    generatorInvocation: GeneratorInvocation;
    workspaceTempDir: DirectoryResult;
    context: TaskContext;
}): Promise<AbsoluteFilePath> {
    const intermediateRepresentation = await generateIntermediateRepresentation({
        workspace,
        audiences,
        generationLanguage: generatorInvocation.language,
    });
    const migratedIntermediateRepresentation = migrateIntermediateRepresentationForGenerator({
        intermediateRepresentation,
        context,
        targetGenerator: {
            name: generatorInvocation.name,
            version: generatorInvocation.version,
        },
    });

    const irFile = await tmp.file({
        tmpdir: workspaceTempDir.path,
    });
    const absolutePathToIr = AbsoluteFilePath.of(irFile.path);
    await streamObjectToFile(absolutePathToIr, migratedIntermediateRepresentation, { pretty: true });
    return absolutePathToIr;
}
