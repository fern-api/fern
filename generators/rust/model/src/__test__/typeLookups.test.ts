import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { generateModels } from "../generateModels.js";
import { hasDefaultImpl, namedTypeHasDefaultImpl } from "../utils/primitiveTypeUtils.js";
import { createSampleGeneratorContext } from "./util/createSampleGeneratorContext.js";

function originalName(name: FernIr.NameOrString): string {
    return typeof name === "string" ? name : name.originalName;
}

function typeIdOf(context: Awaited<ReturnType<typeof createSampleGeneratorContext>>, name: string): string {
    const entry = Object.entries(context.ir.types).find(([, type]) => originalName(type.name.name) === name);
    if (entry == null) {
        throw new Error(`Type ${name} not found in IR`);
    }
    return entry[0];
}

describe("hasDefaultImpl with circular types", () => {
    it("generates the same derives whether or not Default support was already computed", async () => {
        const fresh = generateModels({ context: await createSampleGeneratorContext("rust-circular-types") });

        const warmed = await createSampleGeneratorContext("rust-circular-types");
        for (const typeId of Object.keys(warmed.ir.types).reverse()) {
            namedTypeHasDefaultImpl(typeId, warmed);
        }
        const fromWarmed = generateModels({ context: warmed });

        expect(fromWarmed.map((f) => [f.filename, f.fileContents])).toEqual(
            fresh.map((f) => [f.filename, f.fileContents])
        );
        for (const file of fresh) {
            await expect(file.fileContents).toMatchFileSnapshot(`snapshots/rust-circular-types/${file.filename}`);
        }
    });

    it("gives the same answer regardless of which type is analyzed first", async () => {
        const expected: Record<string, boolean> = {
            Kind: false,
            A: false,
            B: false,
            Root: false,
            C: false,
            D: true,
            E: true,
            Payload: true,
            Wrapper: true,
            Node: true,
            Leaf: true
        };

        // Ask about each type first on its own fresh context, so nothing else primed the answer.
        for (const startName of Object.keys(expected)) {
            const context = await createSampleGeneratorContext("rust-circular-types");
            namedTypeHasDefaultImpl(typeIdOf(context, startName), context);

            for (const [name, isDefault] of Object.entries(expected)) {
                expect(namedTypeHasDefaultImpl(typeIdOf(context, name), context), `${name} after ${startName}`).toBe(
                    isDefault
                );
            }
        }
    });

    it("keeps unknownHasDefault results separate, including through named types", async () => {
        const context = await createSampleGeneratorContext("rust-circular-types");

        const bareUnknown = FernIr.TypeReference.unknown();
        expect(hasDefaultImpl(bareUnknown, context)).toBe(true);
        expect(hasDefaultImpl(bareUnknown, context, { unknownHasDefault: false })).toBe(false);

        // Wrapper holds a Payload, which holds the `unknown`, so the two readings have
        // to stay distinct after a hop through a declared type as well.
        for (const name of ["Payload", "Wrapper"]) {
            const typeId = typeIdOf(context, name);
            expect(namedTypeHasDefaultImpl(typeId, context), name).toBe(true);
            expect(namedTypeHasDefaultImpl(typeId, context, { unknownHasDefault: false }), name).toBe(false);
        }
    });
});

describe("type lookups", () => {
    it("resolve every declared type to its own unique name and filename", async () => {
        const context = await createSampleGeneratorContext("rust-circular-types");

        for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
            expect(context.getUniqueTypeNameForDeclaration(typeDeclaration)).toBe(
                context.project.filenameRegistry.getSchemaTypeTypeNameOrThrow(typeId)
            );
            expect(context.getUniqueFilenameForType(typeDeclaration)).toBe(
                context.project.filenameRegistry.getSchemaTypeFilenameOrThrow(typeId)
            );
            expect(context.getUniqueTypeNameForReference(typeDeclaration.name)).toBe(
                context.getUniqueTypeNameForDeclaration(typeDeclaration)
            );
        }
    });

    it("falls back to the pascal-cased name for references not in the IR", async () => {
        const context = await createSampleGeneratorContext("rust-circular-types");
        const leaf = Object.values(context.ir.types).find((type) => originalName(type.name.name) === "Leaf");
        if (leaf == null) {
            throw new Error("Leaf not found in IR");
        }
        const missing = {
            originalName: "MissingType",
            camelCase: { unsafeName: "missingType", safeName: "missingType" },
            snakeCase: { unsafeName: "missing_type", safeName: "missing_type" },
            screamingSnakeCase: { unsafeName: "MISSING_TYPE", safeName: "MISSING_TYPE" },
            pascalCase: { unsafeName: "MissingType", safeName: "MissingType" }
        };
        expect(context.getUniqueTypeNameForReference({ ...leaf.name, name: missing })).toBe("MissingType");
    });
});
