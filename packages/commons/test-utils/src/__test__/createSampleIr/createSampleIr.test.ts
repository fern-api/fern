import { resolve } from "node:path";

import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { createSampleIr } from "../../createSampleIr";

describe("createSampleIr", () => {
    it("should create a sample IR", async () => {
        const absolutePathToWorkspace = AbsoluteFilePath.of(resolve(__dirname, "example-definition-1"));
        const ir = await createSampleIr(absolutePathToWorkspace);
        await expect(ir).toMatchFileSnapshot("snapshots/example-definition-1.ir.json");
    });
});
