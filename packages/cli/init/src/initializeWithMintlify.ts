import { AbsoluteFilePath, cwd, doesPathExist, isURL, resolve } from "@fern-api/fs-utils";
import { runMintlifyMigration } from "@fern-api/mintlify-importer";
import { TaskContext } from "@fern-api/task-context";

export const initializeWithMintlify = async ({
    pathToMintJson,
    context
}: {
    pathToMintJson?: string;
    context: TaskContext;
}): Promise<void> => {
    // The file path should include `mint.json` in it
    if (!pathToMintJson?.includes("mint.json")) {
        context.failAndThrow("Provide a path to a mint.json file");
        return;
    }

    let absolutePathToMintJson: AbsoluteFilePath | undefined = undefined;

    // @todo get urls to work - for now, throw an error if the user provides a URL
    if (isURL(pathToMintJson)) {
        context.failAndThrow(
            "Clone the repo locally and run this command again by referencing the path to the local mint.json file"
        );
        return;
    } else {
        absolutePathToMintJson = AbsoluteFilePath.of(resolve(cwd(), pathToMintJson));
    }

    const pathExists = await doesPathExist(absolutePathToMintJson);

    if (!pathExists || !absolutePathToMintJson) {
        context.failAndThrow(`${absolutePathToMintJson} does not exist`);
        return;
    }

    const outputPath = AbsoluteFilePath.of(cwd());

    await runMintlifyMigration({
        absolutePathToMintJson,
        outputPath,
        context
    });
};
