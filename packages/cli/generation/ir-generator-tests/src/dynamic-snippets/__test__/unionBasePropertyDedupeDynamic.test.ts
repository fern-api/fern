import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { convertIrToDynamicSnippetsIr } from "@fern-api/ir-generator";
import { dynamic as DynamicSnippets } from "@fern-api/ir-sdk";
import path from "path";

import { generateIRFromPath } from "../../ir/__test__/generateAndSnapshotIR.js";

const FIXTURE_DIR = path.join(__dirname, "../../ir/__test__/fixtures/union-base-property-dedupe/fern");

// The dynamic IR mirrors the regular-IR dedupe facts so the snippet generators read the same source
// of truth. The converter copies the pre-computed regular-IR facts rather than recomputing them.
describe("dynamic IR mirrors the union base-property dedupe facts", () => {
    let dynamicIr: DynamicSnippets.DynamicIntermediateRepresentation;

    beforeAll(async () => {
        const ir = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(FIXTURE_DIR),
            workspaceName: "unionBasePropertyDedupeDynamic",
            audiences: { type: "all" }
        });
        dynamicIr = convertIrToDynamicSnippetsIr({ ir, smartCasing: true, disableExamples: true });
    });

    function getNamedType(typeName: string): DynamicSnippets.NamedType {
        const entry = Object.entries(dynamicIr.types).find(([typeId]) => typeId.endsWith(`:${typeName}`));
        if (entry == null) {
            throw new Error(`No dynamic type found for ${typeName}`);
        }
        return entry[1];
    }

    it("mirrors inheritedBaseProperties onto the dynamic discriminated union", () => {
        const geometry = getNamedType("Geometry");
        if (geometry.type !== "discriminatedUnion") {
            throw new Error(`Geometry is not a discriminatedUnion (was ${geometry.type})`);
        }
        expect(geometry.inheritedBaseProperties.map((property) => property.wireValue)).toEqual(["shape"]);
    });

    it("mirrors deferredUnionBaseProperties onto the dynamic object", () => {
        const circle = getNamedType("Circle");
        if (circle.type !== "object") {
            throw new Error(`Circle is not an object (was ${circle.type})`);
        }
        expect(circle.deferredUnionBaseProperties?.map((property) => property.wireValue)).toEqual(["shape"]);

        // An object that is not exclusively a union variant carries no deferred set.
        const tagged = getNamedType("Tagged");
        if (tagged.type !== "object") {
            throw new Error(`Tagged is not an object (was ${tagged.type})`);
        }
        expect(tagged.deferredUnionBaseProperties).toBeUndefined();
    });
});
