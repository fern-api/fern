import axios from "axios";
import { writeFile } from "fs/promises";
import { dump } from "js-yaml";
import { join } from "path";
import tmp from "tmp-promise";

import { Logger } from "../../../logger/src/Logger";

export type LoadOpenAPIResult = SuccessLoadOpenAPI | FailedLoadOpenAPI;

export enum LoadOpenAPIStatus {
    Success = "success",
    Failure = "failure"
}
export interface SuccessLoadOpenAPI {
    status: LoadOpenAPIStatus.Success;
    filePath: string;
}

export interface FailedLoadOpenAPI {
    status: LoadOpenAPIStatus.Failure;
    errorMessage: string;
}

export async function loadOpenAPIFromUrl({ url, logger }: { url: string; logger: Logger }): Promise<LoadOpenAPIResult> {
    try {
        const data = await fetchOpenAPIFromUrl({ url, logger });
        const tmpDir = await tmp.dir();
        const filePath = join(tmpDir.path, url.endsWith(".json") ? "openapi.json" : "openapi.yaml");
        logger.debug("tmpDir", tmpDir.path);
        logger.debug("filePath", filePath);
        await writeFile(filePath, data);
        return {
            status: LoadOpenAPIStatus.Success,
            filePath
        };
    } catch (error) {
        logger.debug(`Encountered an error while loading OpenAPI spec: ${JSON.stringify(error)}`);
        const errorMessage = `Failed to load OpenAPI spec from ${url}`;
        return {
            status: LoadOpenAPIStatus.Failure,
            errorMessage
        };
    }
}

async function fetchOpenAPIFromUrl({ url, logger }: { url: string; logger: Logger }): Promise<string> {
    const response = await axios.get(url);
    const contentType = response.headers["content-type"] ?? "";

    if (contentType.includes("json") || url.endsWith(".json")) {
        return typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2);
    }

    if (contentType.includes("yaml") || url.endsWith(".yml") || url.endsWith(".yaml")) {
        return typeof response.data === "string" ? response.data : dump(response.data);
    }

    logger.warn(
        `Unrecognized Content-Type "${contentType}" from endpoint ${url}. Please ensure you're pointing to a URL that returns JSON or YAML and not HTML (e.g. Swagger UI webpage)`
    );
    return dump(response.data);
}
