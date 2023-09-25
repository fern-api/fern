import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { FERNIGNORE_FILENAME, SNIPPET_JSON_FILENAME } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import decompress from "decompress";
import { cp, readdir, readFile } from "fs/promises";
import tmp from "tmp-promise";

export declare namespace LocalTaskHandler {
    export interface Init {
        context: TaskContext;
        absolutePathToTmpOutputDirectory: AbsoluteFilePath;
        absolutePathToTmpSnippetJSON: AbsoluteFilePath | undefined;
        absolutePathToLocalOutput: AbsoluteFilePath;
    }
}

export class LocalTaskHandler {
    private context: TaskContext;
    private absolutePathToTmpOutputDirectory: AbsoluteFilePath;
    private absolutePathToTmpSnippetJSON: AbsoluteFilePath | undefined;
    private absolutePathToLocalOutput: AbsoluteFilePath;

    constructor({
        context,
        absolutePathToTmpOutputDirectory,
        absolutePathToTmpSnippetJSON,
        absolutePathToLocalOutput,
    }: LocalTaskHandler.Init) {
        this.context = context;
        this.absolutePathToLocalOutput = absolutePathToLocalOutput;
        this.absolutePathToTmpOutputDirectory = absolutePathToTmpOutputDirectory;
        this.absolutePathToTmpSnippetJSON = absolutePathToTmpSnippetJSON;
    }

    public async copyGeneratedFiles(): Promise<void> {
        if (await this.isFernIgnorePresent()) {
            await this.copyGeneratedFilesWithFernIgnore();
        } else {
            await this.copyGeneratedFilesNoFernIgnore();
        }
        if (this.absolutePathToTmpSnippetJSON !== undefined) {
            await this.copySnippetJSON(this.absolutePathToTmpSnippetJSON);
        }
    }

    private async isFernIgnorePresent(): Promise<boolean> {
        const absolutePathToFernignore = AbsoluteFilePath.of(
            join(this.absolutePathToLocalOutput, RelativeFilePath.of(FERNIGNORE_FILENAME))
        );
        return await doesPathExist(absolutePathToFernignore);
    }

    private async copyGeneratedFilesWithFernIgnore(): Promise<void> {
        // Step 1: Create temp directory to resolve .fernignore
        const tmpOutputResolutionDir = AbsoluteFilePath.of((await tmp.dir({})).path);

        // Step 2: Read all .fernignore paths
        const absolutePathToFernignore = AbsoluteFilePath.of(
            join(this.absolutePathToLocalOutput, RelativeFilePath.of(FERNIGNORE_FILENAME))
        );
        const fernIngnorePaths = await getFernIgnorePaths({ absolutePathToFernignore });

        // Step 3: Copy files from local output to tmp directory
        await cp(this.absolutePathToLocalOutput, tmpOutputResolutionDir, { recursive: true });

        // Step 3: In tmp directory initialize a `.git` directory
        await this.runGitCommand(["init"], tmpOutputResolutionDir);
        await this.runGitCommand(["add", "."], tmpOutputResolutionDir);
        await this.runGitCommand(["commit", "-m", '"init"'], tmpOutputResolutionDir);

        // Step 4: Stage deletions `git rm -rf .`
        await this.runGitCommand(["rm", "-rf", "."], tmpOutputResolutionDir);

        // Step 5: Copy all files from generated temp dir
        await this.copyGeneratedFilesToDirectory(tmpOutputResolutionDir);

        // Step 6: Undo changes to fernignore paths
        await this.runGitCommand(["reset", "--", ...fernIngnorePaths], tmpOutputResolutionDir);
        await this.runGitCommand(["restore", "."], tmpOutputResolutionDir);

        // Step 8: Delete local output directory and copy all files from the generated directory
        this.context.logger.debug(`rm -rf ${this.absolutePathToLocalOutput}`);
        await cp(tmpOutputResolutionDir, this.absolutePathToLocalOutput, { recursive: true });
    }

    /**
     * If no `.fernignore` is present we can delete the local output directory entirely and
     * copy the generated output from the tmp directory.
     */
    private async copyGeneratedFilesNoFernIgnore(): Promise<void> {
        this.context.logger.debug(`rm -rf ${this.absolutePathToLocalOutput}`);
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
        if (firstLocalOutputItem.endsWith(".zip") && remaininglocalOutputItems.length === 0) {
            await decompress(
                join(this.absolutePathToTmpOutputDirectory, RelativeFilePath.of(firstLocalOutputItem)),
                this.absolutePathToLocalOutput,
                {
                    strip: 1,
                }
            );
        } else {
            await cp(this.absolutePathToTmpOutputDirectory, this.absolutePathToLocalOutput, { recursive: true });
        }
    }

    private async copySnippetJSON(absolutePathToTmpSnippetJSON: string): Promise<void> {
        const absolutePathToSnippet = AbsoluteFilePath.of(
            join(this.absolutePathToLocalOutput, RelativeFilePath.of(SNIPPET_JSON_FILENAME))
        );
        await cp(AbsoluteFilePath.of(absolutePathToTmpSnippetJSON), absolutePathToSnippet);
    }

    private async runGitCommand(options: string[], cwd: AbsoluteFilePath): Promise<void> {
        await loggingExeca(this.context.logger, "git", options, {
            cwd,
        });
    }
}

const NEW_LINE_REGEX = /\r?\n/;

async function getFernIgnorePaths({
    absolutePathToFernignore,
}: {
    absolutePathToFernignore: AbsoluteFilePath;
}): Promise<string[]> {
    const fernIgnoreFileContents = (await readFile(absolutePathToFernignore)).toString();
    return [
        FERNIGNORE_FILENAME,
        ...fernIgnoreFileContents
            .trim()
            .split(NEW_LINE_REGEX)
            .filter((line) => !line.startsWith("#")),
    ];
}
