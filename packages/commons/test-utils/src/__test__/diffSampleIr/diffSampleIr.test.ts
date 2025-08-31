import { resolve } from "node:path";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentationChangeDetector } from "@fern-api/ir-utils";
import { createSampleIr } from "../../createSampleIr";

describe("diff sample ir - stable versions", () => {
    it("comparing ", async () => {
        const absolutePathToWorkspace = AbsoluteFilePath.of(resolve(__dirname, "stable/base"));
        const ir = await createSampleIr(absolutePathToWorkspace);
        const ir2 = await createSampleIr(absolutePathToWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from: ir, to: ir2 });
        expect(changes.isBreaking).toBe(false);
        expect(changes.errors).toHaveLength(0);
        expect(changes.bump).toBe("minor");
    });
});
