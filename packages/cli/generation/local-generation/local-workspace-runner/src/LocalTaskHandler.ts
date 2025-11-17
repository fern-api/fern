import { FERNIGNORE_FILENAME } from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import decompress from "decompress";
import { cp, readdir, readFile, rm } from "fs/promises";
import tmp from "tmp-promise";

export declare namespace LocalTaskHandler {
    export interface Init {
        context: TaskContext;
        absolutePathToTmpOutputDirectory: AbsoluteFilePath;
        absolutePathToTmpSnippetJSON: AbsoluteFilePath | undefined;
        absolutePathToLocalSnippetTemplateJSON: AbsoluteFilePath | undefined;
        absolutePathToLocalOutput: AbsoluteFilePath;
        absolutePathToLocalSnippetJSON: AbsoluteFilePath | undefined;
        absolutePathToTmpSnippetTemplatesJSON: AbsoluteFilePath | undefined;
    }
}

export class LocalTaskHandler {
    private context: TaskContext;
    private absolutePathToTmpOutputDirectory: AbsoluteFilePath;
    private absolutePathToTmpSnippetJSON: AbsoluteFilePath | undefined;
    private absolutePathToTmpSnippetTemplatesJSON: AbsoluteFilePath | undefined;
    private absolutePathToLocalSnippetTemplateJSON: AbsoluteFilePath | undefined;
    private absolutePathToLocalOutput: AbsoluteFilePath;
    private absolutePathToLocalSnippetJSON: AbsoluteFilePath | undefined;

    constructor({
        context,
        absolutePathToTmpOutputDirectory,
        absolutePathToTmpSnippetJSON,
        absolutePathToLocalSnippetTemplateJSON,
        absolutePathToLocalOutput,
        absolutePathToLocalSnippetJSON,
        absolutePathToTmpSnippetTemplatesJSON
    }: LocalTaskHandler.Init) {
        this.context = context;
        this.absolutePathToLocalOutput = absolutePathToLocalOutput;
        this.absolutePathToTmpOutputDirectory = absolutePathToTmpOutputDirectory;
        this.absolutePathToTmpSnippetJSON = absolutePathToTmpSnippetJSON;
        this.absolutePathToLocalSnippetJSON = absolutePathToLocalSnippetJSON;
        this.absolutePathToLocalSnippetTemplateJSON = absolutePathToLocalSnippetTemplateJSON;
        this.absolutePathToTmpSnippetTemplatesJSON = absolutePathToTmpSnippetTemplatesJSON;
    }

    public async copyGeneratedFiles(): Promise<void> {
        const isFernIgnorePresent = await this.isFernIgnorePresent();
        const isExistingGitRepo = await this.isGitRepository();

        if (isFernIgnorePresent && isExistingGitRepo) {
            await this.copyGeneratedFilesWithFernIgnoreInExistingRepo();
        } else if (isFernIgnorePresent && !isExistingGitRepo) {
            await this.copyGeneratedFilesWithFernIgnoreInTempRepo();
        } else if (!isFernIgnorePresent && isExistingGitRepo) {
            await this.copyGeneratedFilesNoFernIgnorePreservingGit();
        } else {
            await this.copyGeneratedFilesNoFernIgnoreDeleteAll();
        }

        if (
            this.absolutePathToTmpSnippetJSON != null &&
            this.absolutePathToLocalSnippetJSON != null &&
            (await doesPathExist(this.absolutePathToTmpSnippetJSON))
        ) {
            await this.copySnippetJSON({
                absolutePathToTmpSnippetJSON: this.absolutePathToTmpSnippetJSON,
                absolutePathToLocalSnippetJSON: this.absolutePathToLocalSnippetJSON
            });
        }
    }

    private async isFernIgnorePresent(): Promise<boolean> {
        const absolutePathToFernignore = AbsoluteFilePath.of(
            join(this.absolutePathToLocalOutput, RelativeFilePath.of(FERNIGNORE_FILENAME))
        );
        return await doesPathExist(absolutePathToFernignore);
    }

    private async isGitRepository(): Promise<boolean> {
        const absolutePathToGitDir = AbsoluteFilePath.of(
            join(this.absolutePathToLocalOutput, RelativeFilePath.of(".git"))
        );
        return await doesPathExist(absolutePathToGitDir);
    }

    private async copyGeneratedFilesWithFernIgnoreInExistingRepo(): Promise<void> {
        // Read all .fernignore paths
        const absolutePathToFernignore = AbsoluteFilePath.of(
            join(this.absolutePathToLocalOutput, RelativeFilePath.of(FERNIGNORE_FILENAME))
        );
        const fernIgnorePaths = await getFernIgnorePaths({ absolutePathToFernignore });

        const response = await this.runGitCommand(["config", "--list"], this.absolutePathToLocalOutput);
        if (!response.includes("user.name")) {
            await this.runGitCommand(["config", "user.name", "fern-api"], this.absolutePathToLocalOutput);
            await this.runGitCommand(
                ["config", "user.email", "info@buildwithfern.com"],
                this.absolutePathToLocalOutput
            );
        }

        // Stage deletions `git rm -rf .`
        await this.runGitCommand(["rm", "-rf", "."], this.absolutePathToLocalOutput);

        // Copy all files from generated temp dir
        await this.copyGeneratedFilesToDirectory(this.absolutePathToLocalOutput);

        // If absolutePathToLocalOutput is already a git repository, work directly in it
        await this.runGitCommand(["add", "."], this.absolutePathToLocalOutput);

        // Undo changes to fernignore paths
        await this.runGitCommand(["reset", "--", ...fernIgnorePaths], this.absolutePathToLocalOutput);
        await this.runGitCommand(["restore", "."], this.absolutePathToLocalOutput);
    }

    private async copyGeneratedFilesWithFernIgnoreInTempRepo(): Promise<void> {
        // Create temp directory to resolve .fernignore
        const tmpOutputResolutionDir = AbsoluteFilePath.of((await tmp.dir({})).path);

        // Read all .fernignore paths
        const absolutePathToFernignore = AbsoluteFilePath.of(
            join(this.absolutePathToLocalOutput, RelativeFilePath.of(FERNIGNORE_FILENAME))
        );
        const fernIgnorePaths = await getFernIgnorePaths({ absolutePathToFernignore });

        // Copy files from local output to tmp directory
        await cp(this.absolutePathToLocalOutput, tmpOutputResolutionDir, { recursive: true });

        // In tmp directory initialize a `.git` directory
        await this.runGitCommand(["init"], tmpOutputResolutionDir);
        await this.runGitCommand(["add", "."], tmpOutputResolutionDir);

        const response = await this.runGitCommand(["config", "--list"], tmpOutputResolutionDir);
        if (!response.includes("user.name")) {
            await this.runGitCommand(["config", "user.name", "fern-api"], tmpOutputResolutionDir);
            await this.runGitCommand(["config", "user.email", "info@buildwithfern.com"], tmpOutputResolutionDir);
        }
        await this.runGitCommand(["commit", "--allow-empty", "-m", '"init"'], tmpOutputResolutionDir);

        // Stage deletions `git rm -rf .`
        await this.runGitCommand(["rm", "-rf", "."], tmpOutputResolutionDir);

        // Copy all files from generated temp dir
        await this.copyGeneratedFilesToDirectory(tmpOutputResolutionDir);

        // Undo changes to fernignore paths
        await this.runGitCommand(["reset", "--", ...fernIgnorePaths], tmpOutputResolutionDir);
        await this.runGitCommand(["restore", "."], tmpOutputResolutionDir);

        // remove .git dir before copying files over
        await rm(join(tmpOutputResolutionDir, RelativeFilePath.of(".git")), { recursive: true });

        // Delete local output directory and copy all files from the generated directory
        await rm(this.absolutePathToLocalOutput, { recursive: true });
        await cp(tmpOutputResolutionDir, this.absolutePathToLocalOutput, { recursive: true });
    }

    private async copyGeneratedFilesNoFernIgnorePreservingGit(): Promise<void> {
        // If absolutePathToLocalOutput is a git repository, preserve the .git folder

        // Read directory contents
        const contents = await readdir(this.absolutePathToLocalOutput);

        // Delete everything except .git
        await Promise.all(
            contents
                .filter((item) => item !== ".git")
                .map((item) =>
                    rm(join(this.absolutePathToLocalOutput, RelativeFilePath.of(item)), {
                        force: true,
                        recursive: true
                    })
                )
        );

        // Copy generated files
        await this.copyGeneratedFilesToDirectory(this.absolutePathToLocalOutput);
    }

    private async copyGeneratedFilesNoFernIgnoreDeleteAll(): Promise<void> {
        this.context.logger.debug(`rm -rf ${this.absolutePathToLocalOutput}`);
        await rm(this.absolutePathToLocalOutput, { force: true, recursive: true });
        await this.copyGeneratedFilesToDirectory(this.absolutePathToLocalOutput);
    }

    private async copyGeneratedFilesToDirectory(outputPath: AbsoluteFilePath): Promise<void> {
        const [firstLocalOutputItem, ...remaininglocalOutputItems] = await readdir(
            this.absolutePathToTmpOutputDirectory
        );
        if (firstLocalOutputItem == null) {
            return;
        }
        this.context.logger.debug(`Copying generated files to ${outputPath}`);
        if (firstLocalOutputItem.endsWith(".zip")) {
            await decompress(
                join(this.absolutePathToTmpOutputDirectory, RelativeFilePath.of(firstLocalOutputItem)),
                outputPath
            );
            for (const localOutputItem of remaininglocalOutputItems) {
                await cp(
                    join(this.absolutePathToTmpOutputDirectory, RelativeFilePath.of(localOutputItem)),
                    join(outputPath, RelativeFilePath.of(localOutputItem)),
                    { recursive: true }
                );
            }
        } else {
            await cp(this.absolutePathToTmpOutputDirectory, outputPath, { recursive: true });
        }
    }

    private async copySnippetJSON({
        absolutePathToTmpSnippetJSON,
        absolutePathToLocalSnippetJSON
    }: {
        absolutePathToTmpSnippetJSON: AbsoluteFilePath;
        absolutePathToLocalSnippetJSON: AbsoluteFilePath;
    }): Promise<void> {
        this.context.logger.debug(`Copying generated snippets to ${absolutePathToLocalSnippetJSON}`);
        await cp(absolutePathToTmpSnippetJSON, absolutePathToLocalSnippetJSON);
    }

    private async runGitCommand(options: string[], cwd: AbsoluteFilePath): Promise<string> {
        const response = await loggingExeca(this.context.logger, "git", options, {
            cwd,
            doNotPipeOutput: true
        });
        return response.stdout;
    }
}

const NEW_LINE_REGEX = /\r?\n/;

async function getFernIgnorePaths({
    absolutePathToFernignore
}: {
    absolutePathToFernignore: AbsoluteFilePath;
}): Promise<string[]> {
    const fernIgnoreFileContents = (await readFile(absolutePathToFernignore)).toString();
    return [
        FERNIGNORE_FILENAME,
        ...fernIgnoreFileContents
            .trim()
            .split(NEW_LINE_REGEX)
            .map((line) => {
                // Remove comments at the end of the line
                const commentIndex = line.indexOf("#");
                if (commentIndex !== -1) {
                    return line.slice(0, commentIndex).trim();
                }
                return line.trim();
            })
            .filter((line) => line.length > 0)
    ];
}
