import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { convertIrToDynamicSnippetsIr } from "@fern-api/ir-generator";
import { dynamic as DynamicSnippets } from "@fern-api/ir-sdk";
import path from "path";

import { generateIRFromPath } from "../../ir/__test__/generateAndSnapshotIR.js";

const FIXTURE_DIR = path.join(__dirname, "../../ir/__test__/fixtures/optional-request-body-example/fern");

// A snippet generator only ever sees the dynamic IR, so omittability has to be mirrored onto it.
// It cannot be inferred from `body`: an absent `body` means the endpoint has no body at all, which
// is a different fact from "the caller may skip one".
describe("dynamic IR mirrors request-body omittability", () => {
    let dynamicIr: DynamicSnippets.DynamicIntermediateRepresentation;

    beforeAll(async () => {
        const ir = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(FIXTURE_DIR),
            workspaceName: "optionalRequestBodyDynamic",
            audiences: { type: "all" }
        });
        dynamicIr = convertIrToDynamicSnippetsIr({ ir, smartCasing: true, disableExamples: true });
    }, 200_000);

    function getBodyRequest(endpointName: string): DynamicSnippets.BodyRequest {
        const entry = Object.entries(dynamicIr.endpoints).find(([endpointId]) => endpointId.endsWith(endpointName));
        if (entry == null) {
            throw new Error(`No dynamic endpoint found for ${endpointName}`);
        }
        const request = entry[1].request;
        if (request.type !== "body") {
            throw new Error(`${endpointName} is not a body request (was ${request.type})`);
        }
        return request;
    }

    it("carries bodyRequired: false for a body marked `optional: true`", () => {
        expect(getBodyRequest("optionalReferencedBody").bodyRequired).toBe(false);
    });

    it("leaves bodyRequired unset for a required body and for `optional<T>`", () => {
        // absent means required, so a generator that does not read the field is unaffected
        expect(getBodyRequest("requiredReferencedBody").bodyRequired).toBeUndefined();
        // `optional<T>` says the body's value may be null, which is a different fact
        expect(getBodyRequest("referencedBody").bodyRequired).toBeUndefined();
    });
});
