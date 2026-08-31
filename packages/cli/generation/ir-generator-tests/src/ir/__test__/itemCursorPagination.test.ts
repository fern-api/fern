import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { getWireValue } from "@fern-api/ir-utils";
import path from "path";

import { generateIRFromPath } from "./generateAndSnapshotIR.js";

const ITEM_CURSOR_PAGINATION_DIR = path.join(__dirname, "fixtures/item-cursor-pagination/fern");

describe("item cursor pagination", () => {
    it("reads the cursor from the last element of the results", async () => {
        const ir = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(ITEM_CURSOR_PAGINATION_DIR),
            workspaceName: "itemCursorPagination",
            audiences: { type: "all" }
        });

        const endpoint = Object.values(ir.services)[0]?.endpoints[0];
        const pagination = endpoint?.pagination;
        expect(pagination?.type).toBe("itemCursor");
        if (pagination?.type !== "itemCursor") {
            return;
        }
        expect(getWireValue(pagination.page.property.name)).toBe("starting_after");
        expect(getWireValue(pagination.results.property.name)).toBe("data");
        expect(getWireValue(pagination.itemCursor.property.name)).toBe("token");
        expect(pagination.element).toBe("last");
    });
});
