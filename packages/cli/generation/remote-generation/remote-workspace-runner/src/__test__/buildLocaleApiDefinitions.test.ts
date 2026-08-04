import { type TranslatedApiSpec } from "@fern-api/docs-resolver";
import { type APIV1Write } from "@fern-api/fdr-sdk";
import { type IntermediateRepresentation } from "@fern-api/ir-sdk";
import { type TaskContext } from "@fern-api/task-context";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { buildLocaleApiDefinitions } from "../publishDocsLedger.js";

// Mock the heavy @fern-api/register module so we don't need a real IR.
vi.mock("@fern-api/register", () => ({
    convertIrToFdrApi: vi.fn()
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { convertIrToFdrApi } = await import("@fern-api/register");
const mockConvertIrToFdrApi = convertIrToFdrApi as Mock;

function makeApiDefinition(overrides: Partial<APIV1Write.ApiDefinition> = {}): APIV1Write.ApiDefinition {
    return {
        types: {},
        subpackages: {},
        rootPackage: {
            endpoints: [],
            types: [],
            subpackages: [],
            websockets: [],
            webhooks: []
        },
        auth: undefined,
        snippetsConfiguration: {},
        globalHeaders: [],
        ...overrides
    } as unknown as APIV1Write.ApiDefinition;
}

function makeTranslatedSpec(overrides: Partial<TranslatedApiSpec> = {}): TranslatedApiSpec {
    return {
        ir: {} as IntermediateRepresentation,
        snippetsConfig: {},
        apiName: "translated-api",
        ...overrides
    } as TranslatedApiSpec;
}

function makeContext(): TaskContext {
    return {
        logger: {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        }
    } as unknown as TaskContext;
}

describe("buildLocaleApiDefinitions", () => {
    beforeEach(() => {
        mockConvertIrToFdrApi.mockReset();
    });

    it("replaces base definitions with translated ones for matching API IDs", () => {
        const baseDef = makeApiDefinition({ apiName: "english" } as Partial<APIV1Write.ApiDefinition>);
        const translatedDef = makeApiDefinition({ apiName: "chinese" } as Partial<APIV1Write.ApiDefinition>);
        mockConvertIrToFdrApi.mockReturnValue(translatedDef);

        const baseApiDefinitions = new Map([["api-1", baseDef]]);
        const translatedSpecs = new Map([["api-1", makeTranslatedSpec()]]);
        const context = makeContext();

        const result = buildLocaleApiDefinitions({
            baseApiDefinitions,
            translatedSpecs,
            context
        });

        expect(result.get("api-1")).toBe(translatedDef);
        expect(result.get("api-1")).not.toBe(baseDef);
    });

    it("preserves base definitions for APIs without translations", () => {
        const baseDef1 = makeApiDefinition();
        const baseDef2 = makeApiDefinition();
        const translatedDef = makeApiDefinition({ apiName: "translated" } as Partial<APIV1Write.ApiDefinition>);
        mockConvertIrToFdrApi.mockReturnValue(translatedDef);

        const baseApiDefinitions = new Map([
            ["api-1", baseDef1],
            ["api-2", baseDef2]
        ]);
        // Only api-1 has a translation.
        const translatedSpecs = new Map([["api-1", makeTranslatedSpec()]]);
        const context = makeContext();

        const result = buildLocaleApiDefinitions({
            baseApiDefinitions,
            translatedSpecs,
            context
        });

        expect(result.get("api-1")).toBe(translatedDef);
        expect(result.get("api-2")).toBe(baseDef2);
    });

    it("does not mutate the original base map", () => {
        const baseDef = makeApiDefinition();
        const translatedDef = makeApiDefinition({ apiName: "translated" } as Partial<APIV1Write.ApiDefinition>);
        mockConvertIrToFdrApi.mockReturnValue(translatedDef);

        const baseApiDefinitions = new Map([["api-1", baseDef]]);
        const translatedSpecs = new Map([["api-1", makeTranslatedSpec()]]);
        const context = makeContext();

        buildLocaleApiDefinitions({
            baseApiDefinitions,
            translatedSpecs,
            context
        });

        // The original base map should still have the original definition.
        expect(baseApiDefinitions.get("api-1")).toBe(baseDef);
    });

    it("falls back to base definition when conversion throws", () => {
        const baseDef = makeApiDefinition();
        mockConvertIrToFdrApi.mockImplementation(() => {
            throw new Error("IR conversion failed");
        });

        const baseApiDefinitions = new Map([["api-1", baseDef]]);
        const translatedSpecs = new Map([["api-1", makeTranslatedSpec()]]);
        const context = makeContext();

        const result = buildLocaleApiDefinitions({
            baseApiDefinitions,
            translatedSpecs,
            context
        });

        // Should fall back to base, not throw.
        expect(result.get("api-1")).toBe(baseDef);
        expect(context.logger.warn).toHaveBeenCalledWith(
            expect.stringContaining('Failed to convert translated API definition for API "api-1"')
        );
    });

    it("passes correct arguments to convertIrToFdrApi", () => {
        const translatedDef = makeApiDefinition();
        mockConvertIrToFdrApi.mockReturnValue(translatedDef);

        const spec = makeTranslatedSpec({
            apiName: "plant-api",
            snippetsConfig: { typescriptSdk: undefined } as unknown as APIV1Write.SnippetsConfig
        });
        const context = makeContext();

        buildLocaleApiDefinitions({
            baseApiDefinitions: new Map([["api-1", makeApiDefinition()]]),
            translatedSpecs: new Map([["api-1", spec]]),
            context
        });

        expect(mockConvertIrToFdrApi).toHaveBeenCalledWith({
            ir: spec.ir,
            snippetsConfig: spec.snippetsConfig,
            playgroundConfig: spec.playgroundConfig,
            graphqlOperations: spec.graphqlOperations,
            graphqlTypes: spec.graphqlTypes,
            context,
            apiNameOverride: "plant-api"
        });
    });
});
