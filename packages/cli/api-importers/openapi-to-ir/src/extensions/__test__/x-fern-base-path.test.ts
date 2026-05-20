import { ErrorCollector } from "@fern-api/v3-importer-commons";
import { describe, expect, it, vi } from "vitest";

import { FernBasePathExtension } from "../x-fern-base-path.js";

const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn()
};

function makeExtension(document: object): { extension: FernBasePathExtension; errorCollector: ErrorCollector } {
    const errorCollector = new ErrorCollector({
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        logger: mockLogger as any
    });
    const extension = new FernBasePathExtension({
        breadcrumbs: ["x-fern-base-path"],
        document,
        // Only `errorCollector` is used by the parser; cast a minimal stub.
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        context: { errorCollector } as any
    });
    return { extension, errorCollector };
}

describe("FernBasePathExtension", () => {
    it("returns undefined when the extension is absent", () => {
        const { extension, errorCollector } = makeExtension({});
        expect(extension.convert()).toBeUndefined();
        expect(errorCollector.getErrors()).toHaveLength(0);
    });

    it("parses the string form (back-compat)", () => {
        const { extension } = makeExtension({ "x-fern-base-path": "/v1" });
        expect(extension.convert()).toEqual({ path: "/v1", parameters: [] });
    });

    it("parses the structured form with parameters and defaults", () => {
        const { extension } = makeExtension({
            "x-fern-base-path": {
                path: "/{tenant}/{apiVersion}",
                parameters: {
                    tenant: { type: "string", docs: "Tenant slug." },
                    apiVersion: { type: "string", default: "v1beta" }
                }
            }
        });
        expect(extension.convert()).toEqual({
            path: "/{tenant}/{apiVersion}",
            parameters: [
                { name: "tenant", type: "string", default: undefined, docs: "Tenant slug." },
                { name: "apiVersion", type: "string", default: "v1beta", docs: undefined }
            ]
        });
    });

    it("defaults parameter type to string when not specified", () => {
        const { extension } = makeExtension({
            "x-fern-base-path": {
                path: "/{apiVersion}",
                parameters: { apiVersion: { default: "v1beta" } }
            }
        });
        const result = extension.convert();
        expect(result?.parameters).toEqual([
            { name: "apiVersion", type: "string", default: "v1beta", docs: undefined }
        ]);
    });

    it("treats placeholders without explicit parameters entries as implicit strings", () => {
        const { extension, errorCollector } = makeExtension({
            "x-fern-base-path": {
                path: "/{tenant}/{apiVersion}",
                parameters: { tenant: { type: "string" } }
            }
        });
        const result = extension.convert();
        expect(result?.parameters.map((p) => p.name).sort()).toEqual(["apiVersion", "tenant"]);
        expect(errorCollector.getErrors()).toHaveLength(0);
    });

    it("reports an error when a `parameters` entry has no matching placeholder", () => {
        const { extension, errorCollector } = makeExtension({
            "x-fern-base-path": {
                path: "/{apiVersion}",
                parameters: { tenant: { type: "string" } }
            }
        });
        expect(extension.convert()).toBeUndefined();
        expect(errorCollector.getErrors()).toContainEqual(
            expect.objectContaining({ message: expect.stringContaining("tenant") })
        );
    });

    it("reports an error when the path does not start with /", () => {
        const { extension, errorCollector } = makeExtension({
            "x-fern-base-path": { path: "v1" }
        });
        expect(extension.convert()).toBeUndefined();
        expect(errorCollector.getErrors().length).toBeGreaterThan(0);
    });

    it("reports an error when the structured value is missing `path`", () => {
        const { extension, errorCollector } = makeExtension({
            "x-fern-base-path": { parameters: {} }
        });
        expect(extension.convert()).toBeUndefined();
        expect(errorCollector.getErrors()).toContainEqual(
            expect.objectContaining({ message: expect.stringContaining("must be a string") })
        );
    });

    it("reports an error when `parameters` is not an object", () => {
        const { extension, errorCollector } = makeExtension({
            "x-fern-base-path": { path: "/v1", parameters: ["apiVersion"] }
        });
        expect(extension.convert()).toBeUndefined();
        expect(errorCollector.getErrors()).toContainEqual(
            expect.objectContaining({ message: expect.stringContaining("must be an object map") })
        );
    });

    it("preserves placeholder order in the parsed parameter list", () => {
        const { extension } = makeExtension({
            "x-fern-base-path": {
                path: "/{a}/{b}/{c}",
                parameters: { c: { default: "c-default" } }
            }
        });
        const result = extension.convert();
        expect(result?.parameters.map((p) => p.name)).toEqual(["a", "b", "c"]);
    });
});
