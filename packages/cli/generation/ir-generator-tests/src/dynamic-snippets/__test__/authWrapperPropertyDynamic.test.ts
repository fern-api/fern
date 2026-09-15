import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { convertIrToDynamicSnippetsIr } from "@fern-api/ir-generator";
import path from "path";

import { generateIRFromPath } from "../../ir/__test__/generateAndSnapshotIR.js";

const TEST_DEFINITIONS_DIR = path.join(__dirname, "../../../../../../../test-definitions");

describe("dynamic auth wrapperProperty", () => {
    it("leaves wrapperProperty unset for a single auth scheme", async () => {
        const ir = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(path.join(TEST_DEFINITIONS_DIR, "fern/apis/basic-auth")),
            workspaceName: "dynamicAuthWrapperPropertySingle",
            audiences: { type: "all" }
        });
        const dynamicIr = convertIrToDynamicSnippetsIr({ ir, smartCasing: true, disableExamples: true });
        const endpoint = Object.values(dynamicIr.endpoints)[0];

        expect(endpoint?.auth?.wrapperProperty).toBeUndefined();
    });

    it("sets wrapperProperty to the camelCase auth scheme key for ANY auth", async () => {
        const ir = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(path.join(TEST_DEFINITIONS_DIR, "fern/apis/any-auth")),
            workspaceName: "dynamicAuthWrapperPropertyAny",
            audiences: { type: "all" }
        });
        const dynamicIr = convertIrToDynamicSnippetsIr({ ir, smartCasing: true, disableExamples: true });
        const endpoint = Object.values(dynamicIr.endpoints)[0];

        expect(endpoint?.auth?.wrapperProperty?.camelCase.safeName).toBe("bearer");
        expect(endpoint?.auth?.type).toBe("bearer");
    });
});
