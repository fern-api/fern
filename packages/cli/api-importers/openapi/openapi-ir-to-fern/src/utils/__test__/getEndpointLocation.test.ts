import { Endpoint, HttpMethod } from "@fern-api/openapi-ir";
import { describe, expect, it } from "vitest";
import { getEndpointLocation } from "../getEndpointLocation.js";

function createEndpoint({ operationId, tags }: { operationId: string; tags: string[] }): Endpoint {
    return {
        authed: false,
        security: undefined,
        internal: undefined,
        idempotent: undefined,
        method: HttpMethod.Post,
        audiences: [],
        path: "/example",
        summary: undefined,
        subtitle: undefined,
        operationId,
        tags,
        pathParameters: [],
        queryParameters: [],
        headers: [],
        sdkName: undefined,
        generatedRequestName: "Request",
        requestNameOverride: undefined,
        request: undefined,
        response: undefined,
        errors: {},
        servers: [],
        examples: [],
        pagination: undefined,
        description: undefined,
        availability: undefined,
        source: undefined,
        namespace: undefined,
        retries: undefined,
        globalParameterIds: undefined
    };
}

describe("getEndpointLocation", () => {
    describe("by default", () => {
        it("keeps the tag prefix and loses word boundaries for an underscore-separated operation id", () => {
            const { file, endpointId } = getEndpointLocation(
                createEndpoint({ operationId: "Sharing_ListFolderMembers", tags: ["sharing"] })
            );
            expect(file).toBe("sharing.yml");
            expect(endpointId).toBe("listfoldermembers");
        });

        it("does not strip the tag prefix when the operation id contains a digit", () => {
            const { file, endpointId } = getEndpointLocation(
                createEndpoint({ operationId: "filesGetThumbnailV2", tags: ["files"] })
            );
            expect(file).toBe("files.yml");
            expect(endpointId).toBe("filesGetThumbnailV2");
        });

        it("does not strip the tag prefix when the tag itself has multiple words", () => {
            const { file, endpointId } = getEndpointLocation(
                createEndpoint({ operationId: "FileProperties_TemplatesGetForUser", tags: ["file_properties"] })
            );
            expect(file).toBe("fileProperties.yml");
            expect(endpointId).toBe("FileProperties_TemplatesGetForUser");
        });
    });

    describe("with respectOperationIdWordBoundaries", () => {
        const options = { respectOperationIdWordBoundaries: true };

        it("strips the tag prefix and preserves word boundaries for an underscore-separated operation id", () => {
            const { file, endpointId } = getEndpointLocation(
                createEndpoint({ operationId: "Sharing_ListFolderMembers", tags: ["sharing"] }),
                options
            );
            expect(file).toBe("sharing.yml");
            expect(endpointId).toBe("listFolderMembers");
        });

        it("strips the tag prefix when the operation id contains a digit", () => {
            const { file, endpointId } = getEndpointLocation(
                createEndpoint({ operationId: "filesGetThumbnailV2", tags: ["files"] }),
                options
            );
            expect(file).toBe("files.yml");
            expect(endpointId).toBe("getThumbnailV2");
        });

        it("strips a multi-word tag prefix", () => {
            const { file, endpointId } = getEndpointLocation(
                createEndpoint({ operationId: "FileProperties_TemplatesGetForUser", tags: ["file_properties"] }),
                options
            );
            expect(file).toBe("fileProperties.yml");
            expect(endpointId).toBe("templatesGetForUser");
        });

        it("keeps the operation id when stripping the tag prefix would leave a leading digit", () => {
            const { file, endpointId } = getEndpointLocation(
                createEndpoint({ operationId: "files2GetThumbnail", tags: ["files"] }),
                options
            );
            expect(file).toBe("files.yml");
            expect(endpointId).toBe("files2GetThumbnail");
        });

        it("keeps the operation id when it does not share a prefix with the tag", () => {
            const { file, endpointId } = getEndpointLocation(
                createEndpoint({ operationId: "listFolderMembers", tags: ["sharing"] }),
                options
            );
            expect(file).toBe("sharing.yml");
            expect(endpointId).toBe("listFolderMembers");
        });
    });
});
