import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath, join } from "@fern-api/path-utils";
import { readFileSync } from "fs";

import { DynamicSnippetsGeneratorContext } from "../context/DynamicSnippetsGeneratorContext.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const TEST_DEFINITIONS = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
);

function buildContext(
    definition: string,
    customConfig?: { capitalizeInitialisms?: boolean }
): DynamicSnippetsGeneratorContext {
    const ir: FernIr.dynamic.DynamicIntermediateRepresentation = JSON.parse(
        readFileSync(join(TEST_DEFINITIONS, definition), "utf-8")
    );
    return new DynamicSnippetsGeneratorContext({ ir, config: buildGeneratorConfig({ customConfig }) });
}

function getDeclaration(context: DynamicSnippetsGeneratorContext, typeId: string): FernIr.dynamic.Declaration {
    const type = context.ir.types[typeId];
    if (type == null) {
        throw new Error(`Missing type ${typeId}`);
    }
    return type.declaration;
}

// The expected names match the structs in seed/rust-sdk/extends and seed/rust-sdk/cross-package-type-names.
describe("type names", () => {
    it("uses Rust casing for initialisms", () => {
        const context = buildContext("extends.json");
        expect(context.getStructName(getDeclaration(context, "type_:JSON"))).toBe("Json");
    });

    it("keeps initialisms when capitalizeInitialisms is set", () => {
        const context = buildContext("extends.json", { capitalizeInitialisms: true });
        expect(context.getStructName(getDeclaration(context, "type_:JSON"))).toBe("JSON");
    });

    it("uses the collision-resolved name for a type that shares its name with another type", () => {
        const context = buildContext("cross-package-type-names.json");
        expect(context.getStructName(getDeclaration(context, "type_folder-a/service:Response"))).toBe("Response");
        expect(context.getStructName(getDeclaration(context, "type_folder-d/service:Response"))).toBe("Response2");
    });
});
