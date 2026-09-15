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

    it.each([
        ["any-auth", "bearer", "Bearer"],
        ["endpoint-security-auth", "bearer", "Bearer"]
    ])("sets wrapperProperty for %s auth", async (fixtureName, expectedSafeName, expectedOriginalName) => {
        const ir = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(path.join(TEST_DEFINITIONS_DIR, "fern/apis", fixtureName)),
            workspaceName: `dynamicAuthWrapperProperty${fixtureName}`,
            audiences: { type: "all" }
        });
        const dynamicIr = convertIrToDynamicSnippetsIr({ ir, smartCasing: true, disableExamples: true });
        const endpoint = Object.values(dynamicIr.endpoints)[0];

        expect(endpoint?.auth?.wrapperProperty?.camelCase.safeName).toBe(expectedSafeName);
        expect(endpoint?.auth?.wrapperProperty?.originalName).toBe(expectedOriginalName);
    });

    it("sets wrapperProperty for the real flattening fixture", async () => {
        const ir = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(
                path.join(TEST_DEFINITIONS_DIR, "fern/apis/ts-flatten-request-any-auth")
            ),
            workspaceName: "dynamicAuthWrapperPropertyFlattening",
            audiences: { type: "all" }
        });
        const dynamicIr = convertIrToDynamicSnippetsIr({ ir, smartCasing: true, disableExamples: true });
        const endpoint = Object.values(dynamicIr.endpoints).find(
            (candidate) => candidate.location.path === "/users/{id}" && candidate.location.method === "PUT"
        );

        expect(endpoint?.auth?.wrapperProperty?.camelCase.safeName).toBe("bearerAuth");
        expect(endpoint?.auth?.wrapperProperty?.originalName).toBe("BearerAuth");
        if (endpoint == null || endpoint.request.type !== "inlined" || endpoint.request.pathParameters == null) {
            throw new Error("Expected the fixture endpoint to have an inlined request");
        }
        expect(endpoint.request.body?.type).toBe("referenced");
        expect(endpoint.request.pathParameters.some((parameter) => parameter.name.wireValue === "id")).toBe(true);
    });
});
