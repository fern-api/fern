import { describe, expect, it } from "vitest";

import { tokenizeOperationId } from "../tokenizeOperationId.js";

describe("tokenizeOperationId", () => {
    describe("by default", () => {
        it("splits camelCase and PascalCase", () => {
            expect(tokenizeOperationId("sharingListFolderMembers")).toEqual(["sharing", "list", "folder", "members"]);
        });

        it("splits on separators without splitting camelCase transitions", () => {
            expect(tokenizeOperationId("Sharing_ListFolderMembers")).toEqual(["sharing", "listfoldermembers"]);
        });

        it("collapses an operation id containing a digit into a single token", () => {
            expect(tokenizeOperationId("filesGetThumbnailV2")).toEqual(["filesgetthumbnailv2"]);
        });
    });

    describe("with respectWordBoundaries", () => {
        it("splits on separators and camelCase transitions", () => {
            expect(tokenizeOperationId("Sharing_ListFolderMembers", true)).toEqual([
                "sharing",
                "list",
                "folder",
                "members"
            ]);
        });

        it("splits digits into their own token", () => {
            expect(tokenizeOperationId("filesGetThumbnailV2", true)).toEqual(["files", "get", "thumbnail", "v", "2"]);
        });

        it("splits multi word tags", () => {
            expect(tokenizeOperationId("file_properties", true)).toEqual(["file", "properties"]);
        });
    });
});
