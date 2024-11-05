import axios from "axios";
import { writeFile } from "fs/promises";
import { join } from "path";
import tmp from "tmp-promise";
import { Logger } from "../../../logger/src/Logger";

export type LoadMintJsonResult = SuccessLoadMintJson | FailedLoadMintJson;

export enum LoadMintJsonStatus {
    Success = "success",
    Failure = "failure"
}
export interface SuccessLoadMintJson {
    status: LoadMintJsonStatus.Success;
    filePath: string;
}

export interface FailedLoadMintJson {
    status: LoadMintJsonStatus.Failure;
    errorMessage: string;
}

// @todo can probably make 1 generic function for loading from a url
// @todo need to fix this since it's not getting json correctly
export async function loadMintJsonFromUrl({
    url,
    logger
}: {
    url: string;
    logger: Logger;
}): Promise<LoadMintJsonResult> {
    try {
        const response = await axios.get(url);
        const jsonData = response.data;
        const tmpDir = await tmp.dir();
        const filePath = join(tmpDir.path, "mint.json");
        logger.debug("tmpDir", tmpDir.path);
        logger.debug("filePath", filePath);
        await writeFile(filePath, jsonData);
        return {
            status: LoadMintJsonStatus.Success,
            filePath
        };
    } catch (error) {
        logger.debug(`Encountered an error while loading MintJson spec: ${JSON.stringify(error)}`);
        const errorMessage = `Failed to load MintJson spec from ${url}`;
        return {
            status: LoadMintJsonStatus.Failure,
            errorMessage
        };
    }
}
