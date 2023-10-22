import axios from "axios";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { join } from "path";
import tmp from "tmp-promise";
import { Logger } from "../../../logger/src/Logger";
import { ApiSection, Endpoint } from "../docsWebsite";

export type LoadOpenAPIResult = SuccessLoadOpenAPI | FailedLoadOpenAPI;

export enum LoadOpenAPIStatus {
    Success = "success",
    Failure = "failure",
}
export interface SuccessLoadOpenAPI {
    status: LoadOpenAPIStatus.Success;
    filePath: string;
}

export interface FailedLoadOpenAPI {
    status: LoadOpenAPIStatus.Failure;
    errorMessage: string;
}

function injectTags(openApiJson: string, _endpointToDocsTagsMap: Map<Endpoint, ApiSection>, logger: Logger): Record<string, unknown> {
    try {
        let openApiObj = JSON.parse(openApiJson);
        const paths = JSON.parse(openApiJson)["paths"];
        for (const path in paths) {
            for (const method in paths[path]) {
                const containsOperationId = Object.keys(paths[path][method]).includes("operationId");
                if (containsOperationId) {
                    const containsTags = Object.keys(paths[path][method]).includes("tags");
                    const opId = paths[path][method]["operationId"];
                    const newTag = _endpointToDocsTagsMap.has(opId) ? _endpointToDocsTagsMap.get(opId) : null;

                    if (!containsTags) { 
                        if (newTag != null) {
                            const existingMethodObj = paths[path][method];
                            paths[path][method] = {
                                ...existingMethodObj,
                                tags: [newTag],
                            };
                            // actually inject method object back into openApiObj
                            openApiObj = {
                                ...openApiObj,
                                paths: {
                                    ...openApiObj["paths"],
                                    [path]: {
                                        ...openApiObj["paths"][path],
                                        [method]: paths[path][method],
                                    },
                                },
                            };
                        }
                    }
                }
            }
        }


        return openApiObj;
    } catch (error) {
        logger.error(`Encountered an error while injecting tags: ${JSON.stringify(error)}`);
        return {};
    }
}
export async function loadOpenAPIFromUrl({
    url,
    endpointToDocsTagsMap,
    logger,
}: {
    url: string;
    endpointToDocsTagsMap: Map<Endpoint, ApiSection> | undefined;
    logger: Logger;
}): Promise<LoadOpenAPIResult> {
    try {
        const response = await axios.get(url);
        let jsonData = response.data;
        if (endpointToDocsTagsMap) {
            jsonData = injectTags(JSON.stringify(jsonData), endpointToDocsTagsMap, logger);
        }
        const filePath = await writeOpenApiToTmpFile(jsonData);
        return {
            status: LoadOpenAPIStatus.Success,
            filePath,
        };
    } catch (error) {
        logger.debug(`Encountered an error while loading OpenAPI spec: ${JSON.stringify(error)}`);
        const errorMessage = `Failed to load OpenAPI spec from ${url}`;
        return {
            status: LoadOpenAPIStatus.Failure,
            errorMessage,
        };
    }
}

export async function writeOpenApiToTmpFile(openApiObj: Record<string, unknown>): Promise<string> {
    console.log("yaml dumping");
    const yamlData = yaml.dump(openApiObj);
    console.log("yaml dump success");
    const tmpDir = await tmp.dir();
    const filePath = join(tmpDir.path, "openapi.yml");
    await writeFile(filePath, yamlData);
    return filePath;
}

// import {} from "@fern-api/"
// export function injectTagsIntoOpenApi(openApiObj: unknown, tagsToInject: string[]): unknown  {
//     if (tagsToInject.length === 0 || openApiObj == null || typeof openApiObj !== "object") {
//         return openApiObj;
//     }

//     try {
//         const paths = openApiObj["paths"] != null && typeof openApiObj["paths"] === "object" ? openApiObj["paths"] : {};
        
//         for (const path in paths) {
//             for (const method in paths[path]) {
//                 const containsOperationId = Object.keys(paths[path][method]).includes("operationId");
//                 if (containsOperationId) {
//                     const containsTags = Object.keys(paths[path][method]).includes("tags");
//                     const opId = paths[path][method]["operationId"];
//                     const newTag = _endpointToDocsTagsMap.has(opId) ? _endpointToDocsTagsMap.get(opId) : null;

//                     if (!containsTags) { 
//                         if (newTag != null) {
//                             const existingMethodObj = paths[path][method];
//                             paths[path][method] = {
//                                 ...existingMethodObj,
//                                 tags: [newTag],
//                             };
//                             // actually inject method object back into openApiObj
//                             openApiObj = {
//                                 ...openApiObj,
//                                 paths: {
//                                     ...openApiObj["paths"],
//                                     [path]: {
//                                         ...openApiObj["paths"][path],
//                                         [method]: paths[path][method],
//                                     },
//                                 },
//                             };
//                         }
//                     }
//                 }
//             }
//         }

//         return openApiObj;
//     } catch (error) {
//         logger.error(`Encountered an error while injecting tags: ${JSON.stringify(error)}`);
//         return {};
//     }
// }