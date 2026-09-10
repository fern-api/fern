import { getParseOptions } from "@fern-api/openapi-ir-parser";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it } from "vitest";

import { GroupNameAndLocation } from "../../../../types/GroupNameAndLocation.js";
import { OpenAPIConverterContext3_1 } from "../../../OpenAPIConverterContext3_1.js";
import { AbstractOperationConverter } from "../AbstractOperationConverter.js";

class TestOperationConverter extends AbstractOperationConverter {
    public convert(): AbstractOperationConverter.Output | undefined {
        return undefined;
    }

    public computeGroupName(): GroupNameAndLocation {
        return this.computeGroupNameFromTagAndOperationId();
    }
}

function computeGroupName({
    operationId,
    tag,
    respectOperationIdWordBoundaries
}: {
    operationId: string;
    tag: string;
    respectOperationIdWordBoundaries: boolean;
}): GroupNameAndLocation {
    // Only `settings` is read by the grouping logic, so a stub context is enough.
    const context = {
        settings: getParseOptions({ overrides: { respectOperationIdWordBoundaries } })
    } as unknown as OpenAPIConverterContext3_1;
    const converter = new TestOperationConverter({
        context,
        breadcrumbs: [],
        operation: { operationId, tags: [tag] },
        method: OpenAPIV3.HttpMethods.GET,
        path: "/example"
    });
    return converter.computeGroupName();
}

describe("computeGroupNameFromTagAndOperationId", () => {
    describe("by default", () => {
        it("jams the words of an underscore separated operation id together", () => {
            expect(
                computeGroupName({
                    operationId: "Sharing_ListFolderMembers",
                    tag: "sharing",
                    respectOperationIdWordBoundaries: false
                })
            ).toEqual({ group: ["sharing"], method: "listfoldermembers" });
        });

        it("does not strip a tag prefix from an operation id containing a digit", () => {
            expect(
                computeGroupName({
                    operationId: "filesGetThumbnailV2",
                    tag: "files",
                    respectOperationIdWordBoundaries: false
                })
            ).toEqual({ group: ["files"], method: "filesGetThumbnailV2" });
        });

        it("does not strip a multi token tag prefix", () => {
            expect(
                computeGroupName({
                    operationId: "FileProperties_TemplatesGetForUser",
                    tag: "file_properties",
                    respectOperationIdWordBoundaries: false
                })
            ).toEqual({ group: ["file_properties"], method: "FileProperties_TemplatesGetForUser" });
        });

        it("strips a tag prefix from a camelCase operation id", () => {
            expect(
                computeGroupName({
                    operationId: "sharingListFolderMembers",
                    tag: "sharing",
                    respectOperationIdWordBoundaries: false
                })
            ).toEqual({ group: ["sharing"], method: "listFolderMembers" });
        });
    });

    describe("with respectOperationIdWordBoundaries", () => {
        it("strips a tag prefix from an underscore separated operation id", () => {
            expect(
                computeGroupName({
                    operationId: "Sharing_ListFolderMembers",
                    tag: "sharing",
                    respectOperationIdWordBoundaries: true
                })
            ).toEqual({ group: ["sharing"], method: "listFolderMembers" });
        });

        it("strips a tag prefix from an operation id containing a digit", () => {
            expect(
                computeGroupName({
                    operationId: "filesGetThumbnailV2",
                    tag: "files",
                    respectOperationIdWordBoundaries: true
                })
            ).toEqual({ group: ["files"], method: "getThumbnailV2" });
        });

        it("strips a multi token tag prefix", () => {
            expect(
                computeGroupName({
                    operationId: "FileProperties_TemplatesGetForUser",
                    tag: "file_properties",
                    respectOperationIdWordBoundaries: true
                })
            ).toEqual({ group: ["file_properties"], method: "templatesGetForUser" });
        });

        it("keeps the operation id when stripping the tag prefix would leave a leading digit", () => {
            expect(
                computeGroupName({
                    operationId: "files2GetThumbnail",
                    tag: "files",
                    respectOperationIdWordBoundaries: true
                })
            ).toEqual({ group: ["files"], method: "files2GetThumbnail" });
        });

        it("keeps the operation id when the tag is not a prefix of it", () => {
            expect(
                computeGroupName({
                    operationId: "Sharing_ListFolderMembers",
                    tag: "users",
                    respectOperationIdWordBoundaries: true
                })
            ).toEqual({ group: ["users"], method: "Sharing_ListFolderMembers" });
        });
    });
});
