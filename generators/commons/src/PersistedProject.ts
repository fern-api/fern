import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import { cp, readdir } from "fs/promises";
import tmp from "tmp-promise";

export abstract class PersistedProject {
    private directory: AbsoluteFilePath;
    constructor(directory: AbsoluteFilePath) {
        this.directory = directory;
    }

    public abstract installDependencies(logger: Logger): Promise<void>;

    public abstract format(logger: Logger): Promise<void>;

    public abstract build(logger: Logger): Promise<void>;

    public abstract copyProjectAsZipTo({
        destinationZip,
        logger
    }: {
        destinationZip: AbsoluteFilePath;
        logger: Logger;
    }): Promise<void>;

    public abstract copyPublishableContentAsZipTo({
        destinationZip,
        logger
    }: {
        destinationZip: AbsoluteFilePath;
        logger: Logger;
    }): Promise<void>;

    public abstract deleteGitIgnoredFiles(logger: Logger): Promise<void>;

    public async zipDirectoryContents(
        directoryToZip: AbsoluteFilePath,
        { destinationZip, logger }: { destinationZip: AbsoluteFilePath; logger: Logger }
    ): Promise<void> {
        const zip = createLoggingExecutable("zip", {
            cwd: directoryToZip,
            logger,
            // zip is noisy
            doNotPipeOutput: true
        });

        const tmpZipLocation = join(AbsoluteFilePath.of((await tmp.dir()).path), RelativeFilePath.of("output.zip"));
        await zip(["-r", tmpZipLocation, ...(await readdir(directoryToZip))]);
        await cp(tmpZipLocation, destinationZip);
    }

    public async writeArbitraryFiles(run: (pathToProject: AbsoluteFilePath) => Promise<void>): Promise<void> {
        await run(this.directory);
    }
}
