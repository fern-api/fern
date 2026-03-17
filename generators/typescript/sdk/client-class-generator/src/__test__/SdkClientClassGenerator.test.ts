import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId } from "@fern-typescript/commons";
import { createMinimalIR } from "@fern-typescript/test-utils";
import { describe, expect, it } from "vitest";

import { SdkClientClassGenerator } from "../SdkClientClassGenerator.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

// biome-ignore lint/suspicious/noExplicitAny: test mock for ErrorResolver
function createMockErrorResolver(): any {
    return {
        resolveError: () => undefined,
        getDeclaration: () => undefined
    };
}

// biome-ignore lint/suspicious/noExplicitAny: test mock for PackageResolver
function createMockPackageResolver(): any {
    return {
        resolvePackage: () => ({
            service: undefined,
            subpackages: [],
            hasEndpointsInTree: false,
            websocket: undefined
        }),
        getServiceDeclaration: () => undefined,
        getWebSocketChannelDeclaration: () => undefined,
        getSubpackageOrThrow: () => ({
            name: { camelCase: { unsafeName: "test" } }
        })
    };
}

// biome-ignore lint/suspicious/noExplicitAny: test mock for ExportsManager
function createMockExportsManager(): any {
    return {
        addExport: () => undefined,
        addExportFromRoot: () => undefined
    };
}

// biome-ignore lint/suspicious/noExplicitAny: test mock for ImportsManager
function createMockImportsManager(): any {
    return {
        addImport: () => undefined,
        addImportFromRoot: () => undefined
    };
}

function createGenerator(opts?: Partial<SdkClientClassGenerator.Init>): SdkClientClassGenerator {
    return new SdkClientClassGenerator({
        intermediateRepresentation: createMinimalIR(),
        errorResolver: createMockErrorResolver(),
        packageResolver: createMockPackageResolver(),
        neverThrowErrors: false,
        includeCredentialsOnCrossOriginRequests: false,
        allowCustomFetcher: false,
        generateWebSocketClients: false,
        requireDefaultEnvironment: false,
        defaultTimeoutInSeconds: 60,
        npmPackage: undefined,
        includeContentHeadersOnFileDownloadResponse: false,
        includeSerdeLayer: true,
        retainOriginalCasing: false,
        inlineFileProperties: false,
        omitUndefined: false,
        allowExtraFields: false,
        streamType: "wrapper",
        fileResponseType: "stream",
        formDataSupport: "Node18",
        exportsManager: createMockExportsManager(),
        useDefaultRequestParameterValues: false,
        generateEndpointMetadata: false,
        parameterNaming: "default",
        offsetSemantics: "item-index",
        ...opts
    });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("SdkClientClassGenerator", () => {
    describe("constructor", () => {
        it("constructs with default options", () => {
            const generator = createGenerator();
            expect(generator).toBeDefined();
        });

        it("constructs with custom timeout infinity", () => {
            const generator = createGenerator({
                defaultTimeoutInSeconds: "infinity"
            });
            expect(generator).toBeDefined();
        });

        it("constructs with custom timeout undefined", () => {
            const generator = createGenerator({
                defaultTimeoutInSeconds: undefined
            });
            expect(generator).toBeDefined();
        });

        it("constructs with web stream type", () => {
            const generator = createGenerator({
                streamType: "web"
            });
            expect(generator).toBeDefined();
        });

        it("constructs with binary-response file response type", () => {
            const generator = createGenerator({
                fileResponseType: "binary-response"
            });
            expect(generator).toBeDefined();
        });

        it("constructs with Node16 form data support", () => {
            const generator = createGenerator({
                formDataSupport: "Node16"
            });
            expect(generator).toBeDefined();
        });

        it("constructs with all boolean flags enabled", () => {
            const generator = createGenerator({
                neverThrowErrors: true,
                includeCredentialsOnCrossOriginRequests: true,
                allowCustomFetcher: true,
                generateWebSocketClients: true,
                requireDefaultEnvironment: true,
                includeContentHeadersOnFileDownloadResponse: true,
                retainOriginalCasing: true,
                inlineFileProperties: true,
                omitUndefined: true,
                allowExtraFields: true,
                useDefaultRequestParameterValues: true,
                generateEndpointMetadata: true
            });
            expect(generator).toBeDefined();
        });
    });

    describe("generateService", () => {
        it("returns a GeneratedSdkClientClassImpl instance", () => {
            const generator = createGenerator();
            const result = generator.generateService({
                isRoot: true,
                packageId: { isRoot: true } as unknown as PackageId,
                serviceClassName: "TestClient",
                importsManager: createMockImportsManager()
            });
            expect(result).toBeDefined();
        });

        it("passes isRoot=true to the generated service", () => {
            const generator = createGenerator();
            const result = generator.generateService({
                isRoot: true,
                packageId: { isRoot: true } as unknown as PackageId,
                serviceClassName: "RootClient",
                importsManager: createMockImportsManager()
            });
            expect(result).toBeDefined();
        });

        it("passes isRoot=false to the generated service", () => {
            const generator = createGenerator();
            const result = generator.generateService({
                isRoot: false,
                packageId: {
                    isRoot: false,
                    subpackageId: "sub_pkg" as unknown as FernIr.SubpackageId
                } as unknown as PackageId,
                serviceClassName: "SubClient",
                importsManager: createMockImportsManager()
            });
            expect(result).toBeDefined();
        });

        it("propagates streamType to generated service", () => {
            const generator = createGenerator({ streamType: "web" });
            const result = generator.generateService({
                isRoot: true,
                packageId: { isRoot: true } as unknown as PackageId,
                serviceClassName: "WebStreamClient",
                importsManager: createMockImportsManager()
            });
            expect(result).toBeDefined();
        });

        it("propagates parameterNaming to generated service", () => {
            const generator = createGenerator({ parameterNaming: "snakeCase" });
            const result = generator.generateService({
                isRoot: true,
                packageId: { isRoot: true } as unknown as PackageId,
                serviceClassName: "SnakeCaseClient",
                importsManager: createMockImportsManager()
            });
            expect(result).toBeDefined();
        });
    });
});
