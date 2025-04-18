import { OpenAPIV3 } from "openapi-types";

import { MediaType } from "@fern-api/core-utils";

import { isReferenceObject } from "./isReferenceObject";

export function getReferenceOccurrences(document: OpenAPIV3.Document): Record<string, number> {
    const contentConflictsRemovedDocument = removeApplicationJsonAndMultipartConflictsFromDocument(document);
    const occurrences: Record<string, number> = {};
    getReferenceOccurrencesHelper({ obj: contentConflictsRemovedDocument, occurrences, breadcrumbs: [] });
    return occurrences;
}

function getReferenceOccurrencesHelper({
    obj,
    occurrences,
    breadcrumbs
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any;
    occurrences: Record<string, number>;
    breadcrumbs: string[];
}): void {
    if (obj == null) {
        return;
    }

    if (Array.isArray(obj)) {
        for (const element of obj) {
            getReferenceOccurrencesHelper({
                obj: element,
                occurrences,
                breadcrumbs
            });
        }
        return;
    }

    if (typeof obj !== "object") {
        return;
    }

    if (obj.$ref != null && typeof obj.$ref === "string") {
        const refProperty = obj.$ref;
        if (occurrences[refProperty] == null) {
            occurrences[refProperty] = 1;
        } else {
            occurrences[refProperty] += 1;
        }
        return;
    }
    for (const key in obj) {
        getReferenceOccurrencesHelper({
            obj: obj[key],
            occurrences,
            breadcrumbs: [...breadcrumbs, key]
        });
    }
}

function removeApplicationJsonAndMultipartConflictsFromDocument(document: OpenAPIV3.Document): OpenAPIV3.Document {
    return {
        ...document,
        paths: Object.fromEntries(
            Object.entries(document.paths ?? {}).map(([path, pathItem]) => {
                return [
                    path,
                    {
                        ...pathItem,
                        get:
                            pathItem?.get != null
                                ? removeApplicationJsonAndMultipartConflictsFromOperationObject(pathItem.get)
                                : undefined,
                        put:
                            pathItem?.put != null
                                ? removeApplicationJsonAndMultipartConflictsFromOperationObject(pathItem.put)
                                : undefined,
                        post:
                            pathItem?.post != null
                                ? removeApplicationJsonAndMultipartConflictsFromOperationObject(pathItem.post)
                                : undefined,
                        patch:
                            pathItem?.patch != null
                                ? removeApplicationJsonAndMultipartConflictsFromOperationObject(pathItem.patch)
                                : undefined,
                        delete:
                            pathItem?.delete != null
                                ? removeApplicationJsonAndMultipartConflictsFromOperationObject(pathItem.delete)
                                : undefined
                    }
                ];
            })
        )
    };
}

function removeApplicationJsonAndMultipartConflictsFromOperationObject(
    operationObject: OpenAPIV3.OperationObject
): OpenAPIV3.OperationObject {
    return {
        ...operationObject,
        requestBody:
            operationObject.requestBody != null
                ? isReferenceObject(operationObject.requestBody)
                    ? operationObject.requestBody
                    : removeApplicationJsonAndMultipartConflictsFromRequestBody(operationObject.requestBody)
                : undefined
    };
}

function removeApplicationJsonAndMultipartConflictsFromRequestBody(
    requestBody: OpenAPIV3.RequestBodyObject
): OpenAPIV3.RequestBodyObject {
    let jsonContent: OpenAPIV3.MediaTypeObject | undefined;
    let multipartContent: OpenAPIV3.MediaTypeObject | undefined;
    for (const mediatype in requestBody.content) {
        const mimetype = MediaType.parse(mediatype);
        if (mimetype == null) {
            continue;
        }
        if (mimetype.isJSON()) {
            jsonContent = requestBody.content[mediatype];
        } else if (mimetype.isMultipart()) {
            multipartContent = requestBody.content[mediatype];
        }
    }
    if (multipartContent != null && jsonContent != null) {
        return {
            ...requestBody,
            content: {
                [MediaType.MULTIPART_FORM_DATA]: multipartContent
            }
        };
    }
    return requestBody;
}
