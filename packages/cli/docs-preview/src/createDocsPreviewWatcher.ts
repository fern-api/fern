import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";

import Watcher from "watcher";

function isErrnoError(error: Error): error is Error & { code: string } {
    return "code" in error && typeof error.code === "string";
}

function toError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
}

function getWatcherErrorMessage(error: Error): string {
    if (isErrnoError(error) && error.code === "ENOSPC") {
        return (
            "Unable to watch Fern docs files for changes because the system limit for file watchers was reached. " +
            "Close other file-watching processes or increase the file watcher limit, then restart `fern docs dev`."
        );
    }
    return `Unable to watch Fern docs files for changes: ${error.message}`;
}

export async function createDocsPreviewWatcher({
    absoluteFilePathToFern,
    additionalFilepaths,
    context
}: {
    absoluteFilePathToFern: AbsoluteFilePath;
    additionalFilepaths: AbsoluteFilePath[];
    context: TaskContext;
}): Promise<Watcher> {
    const watcher = new Watcher([absoluteFilePathToFern, ...additionalFilepaths], {
        recursive: true,
        ignoreInitial: true,
        debounce: 100,
        renameDetection: true
    });

    const initializationError = await new Promise<Error | undefined>((resolve) => {
        const handleReady = () => {
            watcher.off("error", handleError);
            resolve(undefined);
        };
        const handleError = (error: unknown) => {
            watcher.off("ready", handleReady);
            resolve(toError(error));
        };

        watcher.once("ready", handleReady);
        watcher.once("error", handleError);
    });

    if (initializationError != null) {
        watcher.close();
        context.failAndThrow(getWatcherErrorMessage(initializationError), initializationError, {
            code: CliError.Code.EnvironmentError
        });
    }

    watcher.on("error", (error: unknown) => {
        const watcherError = toError(error);
        context.failWithoutThrowing(getWatcherErrorMessage(watcherError), watcherError, {
            code: CliError.Code.EnvironmentError
        });
        watcher.close();
    });

    return watcher;
}
