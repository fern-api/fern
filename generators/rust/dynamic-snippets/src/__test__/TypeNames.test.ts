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
    customConfig?: { capitalizeInitialisms?: boolean },
    edit?: (ir: FernIr.dynamic.DynamicIntermediateRepresentation) => void
): DynamicSnippetsGeneratorContext {
    const ir: FernIr.dynamic.DynamicIntermediateRepresentation = JSON.parse(
        readFileSync(join(TEST_DEFINITIONS, definition), "utf-8")
    );
    edit?.(ir);
    return new DynamicSnippetsGeneratorContext({ ir, config: buildGeneratorConfig({ customConfig }) });
}

function pascalName(originalName: string, pascal: string): FernIr.Name {
    const casing = { safeName: pascal, unsafeName: pascal };
    return {
        originalName,
        camelCase: casing,
        pascalCase: casing,
        snakeCase: casing,
        screamingSnakeCase: casing
    };
}

function getEndpoint(
    ir: FernIr.dynamic.DynamicIntermediateRepresentation,
    endpointId: string
): FernIr.dynamic.Endpoint {
    const endpoint = ir.endpoints[endpointId];
    if (endpoint == null) {
        throw new Error(`Missing endpoint ${endpointId}`);
    }
    return endpoint;
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

    it("keeps pascal casing overrides", () => {
        const context = buildContext("extends.json", undefined, (ir) => {
            const type = ir.types["type_:JSON"];
            if (type != null) {
                type.declaration.name = pascalName("JSON", "JsonDocument");
            }
        });
        expect(context.getStructName(getDeclaration(context, "type_:JSON"))).toBe("JsonDocument");
        expect(context.pascalSafe(pascalName("red", "Crimson"))).toBe("Crimson");
    });

    it("tells apart same-named types in different files of one package", () => {
        const context = buildContext("cross-package-type-names.json", undefined, (ir) => {
            const typeA = ir.types["type_folder-a/service:Response"];
            const typeD = ir.types["type_folder-d/service:Response"];
            if (typeA == null || typeD == null) {
                throw new Error("Missing Response types");
            }
            const packagePath = typeA.declaration.fernFilepath.packagePath;
            const file = pascalName("other", "Other");
            typeD.declaration.fernFilepath = { packagePath, allParts: [...packagePath, file], file };
        });
        expect(context.getStructName(getDeclaration(context, "type_folder-a/service:Response"))).toBe("Response");
        expect(context.getStructName(getDeclaration(context, "type_folder-d/service:Response"))).toBe("Response2");
    });

    it("registers inline request names before query request names", () => {
        const queryEndpointId = "endpoint_endpoints/pagination.listItems";
        const inlineEndpointId = "endpoint_inlined-requests.postWithObjectBodyandResponse";
        const context = buildContext("exhaustive.json", undefined, (ir) => {
            const request = getEndpoint(ir, inlineEndpointId).request;
            if (request.type === "inlined") {
                request.declaration.name = pascalName("ListItemsQueryRequest", "ListItemsQueryRequest");
            }
        });
        const inlineRequest = getEndpoint(context.ir, inlineEndpointId).request;
        if (inlineRequest.type !== "inlined") {
            throw new Error("Expected an inlined request");
        }
        expect(context.getInlineRequestStructName(inlineRequest.declaration)).toBe("ListItemsQueryRequest");
        expect(context.getQueryRequestNameByEndpoint(getEndpoint(context.ir, queryEndpointId).declaration)).toBe(
            "ListItemsQueryRequest2"
        );
    });
});
