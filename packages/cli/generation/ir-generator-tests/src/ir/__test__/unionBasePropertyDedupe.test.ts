import { AbsoluteFilePath } from "@fern-api/fs-utils";
import {
    IntermediateRepresentation,
    ObjectTypeDeclaration,
    TypeDeclaration,
    UnionTypeDeclaration
} from "@fern-api/ir-sdk";
import { getWireValue } from "@fern-api/ir-utils";
import path from "path";

import { generateIRFromPath } from "./generateAndSnapshotIR.js";

const FIXTURE_DIR = path.join(__dirname, "fixtures/union-base-property-dedupe/fern");

// These IR facts are computed unconditionally during IR generation — `generateIRFromPath` passes no
// generator configuration or dedupe flag, so their presence here demonstrates flag-independence
// (scenario 7): the gating lives in the generators, not the IR.
describe("discriminated-union base-property dedupe facts", () => {
    let ir: IntermediateRepresentation;

    beforeAll(async () => {
        ir = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(FIXTURE_DIR),
            workspaceName: "unionBasePropertyDedupe",
            audiences: { type: "all" }
        });
    });

    function getDeclaration(typeName: string): TypeDeclaration {
        const entry = Object.entries(ir.types).find(([typeId]) => typeId.endsWith(`:${typeName}`));
        if (entry == null) {
            throw new Error(`No type declaration found for ${typeName}`);
        }
        return entry[1];
    }

    function getUnion(typeName: string): UnionTypeDeclaration {
        const shape = getDeclaration(typeName).shape;
        if (shape.type !== "union") {
            throw new Error(`${typeName} is not a union (was ${shape.type})`);
        }
        return shape;
    }

    function getObject(typeName: string): ObjectTypeDeclaration {
        const shape = getDeclaration(typeName).shape;
        if (shape.type !== "object") {
            throw new Error(`${typeName} is not an object (was ${shape.type})`);
        }
        return shape;
    }

    function inheritedWireValues(typeName: string): string[] {
        return getUnion(typeName).inheritedBaseProperties.map((property) => getWireValue(property));
    }

    function deferredWireValues(typeName: string): string[] | undefined {
        return getObject(typeName).deferredUnionBaseProperties?.map((property) => getWireValue(property));
    }

    it("scenario 1: every variant redeclares the base property → View A and View B both list it", () => {
        expect(inheritedWireValues("Geometry")).toEqual(["shape"]);
        expect(deferredWireValues("Circle")).toEqual(["shape"]);
        expect(deferredWireValues("Square")).toEqual(["shape"]);
    });

    it("scenario 2: one variant omits the base property → excluded from View A; carrying object keeps View B", () => {
        // Not every variant carries `note`, so the union does not inherit it.
        expect(inheritedWireValues("Annotated")).toEqual([]);
        // The variant that does carry it (and is exclusively a variant) still defers it.
        expect(deferredWireValues("WithNote")).toEqual(["note"]);
        // The variant that does not declare it defers nothing.
        expect(deferredWireValues("WithoutNote")).toBeUndefined();
    });

    it("scenario 3: same wire name with a conflicting type → excluded from both views", () => {
        expect(inheritedWireValues("Counter")).toEqual([]);
        expect(deferredWireValues("IntCounter")).toBeUndefined();
    });

    it("scenario 4: explicit base property no variant carries → excluded from both, stays a base property", () => {
        expect(inheritedWireValues("MetaHolder")).toEqual([]);
        expect(deferredWireValues("OnlyLocal")).toBeUndefined();
        // `meta` remains a normal base property of the union.
        expect(getUnion("MetaHolder").baseProperties.map((property) => getWireValue(property.name))).toEqual(["meta"]);
    });

    it("scenario 5: variant object also referenced standalone → in View A but excluded from View B (guard b)", () => {
        expect(inheritedWireValues("TaggedUnion")).toEqual(["tag"]);
        // `Tagged` is also a property type of `TaggedWrapper`, so leaf-dropping would corrupt that usage.
        expect(deferredWireValues("Tagged")).toBeUndefined();
    });

    it("scenario 6: alias-of-object variant → alias chain resolved for View A; View B excludes the alias target", () => {
        expect(inheritedWireValues("AliasUnion")).toEqual(["category"]);
        // `Kinded` is an alias target, so guard (b) disqualifies it from leaf-dropping.
        expect(deferredWireValues("Kinded")).toBeUndefined();
    });

    it("extends: a variant carrying the base property via `extends` is resolved for both views", () => {
        expect(inheritedWireValues("Resource")).toEqual(["owner"]);
        expect(deferredWireValues("Repo")).toEqual(["owner"]);
        expect(deferredWireValues("Gist")).toEqual(["owner"]);
    });
});
