import { parseFileUploadRequest } from "@fern-api/fern-definition-schema";

import { Rule } from "../../Rule";

export const NoExtensionsWithFileUploadRule: Rule = {
    name: "no-extensions-with-file-upload",
    create: () => {
        return {
            definitionFile: {
                httpEndpoint: ({ endpoint }) => {
                    if (endpoint.request == null) {
                        return [];
                    }

                    const parsedFileUploadRequest = parseFileUploadRequest(endpoint.request);
                    if (parsedFileUploadRequest?.extends == null) {
                        return [];
                    }

                    return [
                        {
                            severity: "error",
                            message: "Request body extensions are not supported for file-upload requests."
                        }
                    ];
                }
            }
        };
    }
};
