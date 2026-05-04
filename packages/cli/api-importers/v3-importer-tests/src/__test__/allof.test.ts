/**
 * Assertion-based tests for allOf composition edge cases.
 * These tests validate the IR output against expected behavior per the OpenAPI spec,
 * rather than snapshot-matching.
 *
 * Uses the V3 importer (OSSWorkspace) which is the code path for docs customers.
 *
 * Pylon #18189 / Linear FER-9158
 */

import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const FIXTURE_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures/allof/fern"));

interface IRProperty {
    name: string;
    valueType: {
        _type: string;
        container?: {
            _type: string;
            optional?: unknown;
            list?: unknown;
        };
        name?: string;
        typeId?: string;
    };
}

interface IRTypeShape {
    _type: string;
    properties?: IRProperty[];
    extends?: Array<{ name: string; typeId: string }>;
}

interface IRType {
    name: { name: string; typeId: string };
    shape: IRTypeShape;
}

interface IR {
    types: Record<string, IRType>;
}

function findType(ir: IR, name: string): IRType | undefined {
    return Object.values(ir.types).find((t) => t.name.name === name);
}

function findProperty(type: IRType, propName: string): IRProperty | undefined {
    if (type.shape._type !== "object") {
        return undefined;
    }
    return type.shape.properties?.find((p) => p.name === propName);
}

function getOuterType(prop: IRProperty): string {
    return prop.valueType._type;
}

function getContainerType(prop: IRProperty): string | undefined {
    if (prop.valueType._type === "container") {
        return prop.valueType.container?._type;
    }
    return undefined;
}

describe("allOf edge cases", () => {
    let ir: IR;

    beforeAll(async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: FIXTURE_DIR,
            context,
            cliVersion: "0.0.0",
            workspaceName: "allof"
        });
        if (!workspace.didSucceed) {
            throw new Error(`Failed to load fixture: ${JSON.stringify(workspace.failures)}`);
        }
        if (!(workspace.workspace instanceof OSSWorkspace)) {
            throw new Error("Expected OSSWorkspace (V3 importer) but got a different workspace type");
        }
        const intermediateRepresentation = await workspace.workspace.getIntermediateRepresentation({
            context,
            audiences: { type: "all" },
            enableUniqueErrorsPerEndpoint: false,
            generateV1Examples: true,
            logWarnings: false
        });
        // Serialize to JSON, renaming discriminant `type` → `_type` on union objects
        ir = JSON.parse(
            JSON.stringify(intermediateRepresentation, (_key, value) => {
                if (value && typeof value === "object" && "_visit" in value && "type" in value) {
                    const { type, _visit, ...rest } = value;
                    return { _type: type, ...rest };
                }
                return value;
            })
        ) as IR;
    }, 30_000);

    describe("Case A: array items narrowing via allOf", () => {
        it("RuleTypeSearchResponse should exist as a type", () => {
            const type = findType(ir, "RuleTypeSearchResponse");
            expect(type).toBeDefined();
        });

        it("results property should be a list, not optional", () => {
            // biome-ignore lint/style/noNonNullAssertion: verified by prior test
            const type = findType(ir, "RuleTypeSearchResponse")!;
            const results = findProperty(type, "results");
            expect(results).toBeDefined();

            // results is required in the parent PaginatedResult, so it should NOT
            // be wrapped in optional/nullable after allOf composition
            // biome-ignore lint/style/noNonNullAssertion: verified by prior expect
            const containerType = getContainerType(results!);
            expect(containerType).not.toBe("optional");
            expect(containerType).not.toBe("nullable");
            expect(containerType).toBe("list");
        });

        it("results items should be typed as RuleTypeResponse, not unknown", () => {
            // biome-ignore lint/style/noNonNullAssertion: verified by prior test
            const type = findType(ir, "RuleTypeSearchResponse")!;
            const results = findProperty(type, "results");
            expect(results).toBeDefined();

            // Drill into the list's element type — it should be named:RuleTypeResponse
            // biome-ignore lint/style/noNonNullAssertion: verified by prior expect
            const valueType = results!.valueType;
            let listType: Record<string, unknown> | undefined;
            if (valueType._type === "container" && valueType.container?._type === "list") {
                listType = valueType.container.list as Record<string, unknown>;
            } else if (valueType._type === "container" && valueType.container?._type === "optional") {
                // If wrapped in optional (the bug), drill through it
                const inner = valueType.container.optional as Record<string, unknown>;
                if (inner?._type === "container" && (inner.container as Record<string, unknown>)?._type === "list") {
                    listType = (inner.container as Record<string, unknown>).list as Record<string, unknown>;
                }
            }
            expect(listType).toBeDefined();
            expect(listType?._type).toBe("named");
            expect(listType?.name).toBe("RuleTypeResponse");
        });

        it("paging property should remain required (not optional)", () => {
            // biome-ignore lint/style/noNonNullAssertion: verified by prior test
            const type = findType(ir, "RuleTypeSearchResponse")!;
            const paging = findProperty(type, "paging");
            expect(paging).toBeDefined();

            // biome-ignore lint/style/noNonNullAssertion: verified by prior expect
            const containerType = getContainerType(paging!);
            expect(containerType).not.toBe("optional");
        });
    });

    describe("Case B: property-level allOf with $ref + inline primitive", () => {
        it("RuleCreateRequest should exist as a type", () => {
            const type = findType(ir, "RuleCreateRequest");
            expect(type).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: verified by prior expect
            expect(type!.shape._type).toBe("object");
        });

        it("executionContext property should exist", () => {
            // biome-ignore lint/style/noNonNullAssertion: verified by prior test
            const type = findType(ir, "RuleCreateRequest")!;
            const prop = findProperty(type, "executionContext");
            expect(prop).toBeDefined();
        });

        it("executionContext should reference RuleExecutionContext, not be unknown or empty", () => {
            // biome-ignore lint/style/noNonNullAssertion: verified by prior test
            const type = findType(ir, "RuleCreateRequest")!;
            const prop = findProperty(type, "executionContext");
            expect(prop).toBeDefined();

            // executionContext is required in the OpenAPI fixture, so it should NOT
            // be wrapped in optional
            // biome-ignore lint/style/noNonNullAssertion: verified by prior expect
            expect(getContainerType(prop!)).not.toBe("optional");

            // The property should reference the RuleExecutionContext enum.
            // It should NOT be: unknown, an empty object, or a named reference
            // to a synthetic type with zero properties.
            // biome-ignore lint/style/noNonNullAssertion: verified by prior expect
            const outerType = getOuterType(prop!);
            expect(outerType).not.toBe("unknown");

            // If it's a named reference, check it points to RuleExecutionContext
            // (not a synthetic empty object type)
            if (outerType === "named") {
                // biome-ignore lint/style/noNonNullAssertion: verified by prior expect
                expect(prop!.valueType.name).toBe("RuleExecutionContext");
            } else if (outerType === "container") {
                // Could be optional<named:RuleExecutionContext> since the enum
                // doesn't have a default — but the inner type must still reference it
                // biome-ignore lint/style/noNonNullAssertion: verified by prior expect
                const container = prop!.valueType.container!;
                if (container._type === "optional") {
                    const inner = container.optional as Record<string, unknown>;
                    expect(inner?._type).toBe("named");
                    expect(inner?.name).toBe("RuleExecutionContext");
                }
            }
        });
    });

    describe("Case C: required field preservation through allOf", () => {
        it("RuleResponse should exist with all required properties as non-optional", () => {
            const type = findType(ir, "RuleResponse");
            expect(type).toBeDefined();

            for (const requiredProp of ["id", "name", "status", "executionContext"]) {
                // biome-ignore lint/style/noNonNullAssertion: verified by prior expect
                const prop = findProperty(type!, requiredProp);
                expect(prop).toBeDefined();
                // biome-ignore lint/style/noNonNullAssertion: verified by prior expect
                const containerType = getContainerType(prop!);
                expect(containerType).not.toBe("optional");
            }
        });
    });
});
