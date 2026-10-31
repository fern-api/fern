import type { OpenAPISpec, ProtobufSpec, RawSpecsManifestEntry, Spec } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import type { SdkConfigV1SourceSpec } from "@postman/sdk-config/sdk-config/v1";
import { describe, expect, it, vi } from "vitest";

import { prepareSdkSourceSpecs, rewriteSdkConfigSourceSpecs, type SdkSourceSpec } from "../sdkSourceSpecs.js";

function openapi(name: string): OpenAPISpec {
    const file = AbsoluteFilePath.of(`/workspace/${name}.yml`);
    return {
        type: "openapi",
        absoluteFilepath: file,
        absoluteFilepathToOverrides: undefined,
        absoluteFilepathToOverlays: undefined,
        source: { type: "openapi", file }
    };
}

function proto(
    name: string,
    { fromOpenAPI = true, target }: { fromOpenAPI?: boolean; target?: string } = {}
): ProtobufSpec {
    return {
        type: "protobuf",
        absoluteFilepathToProtobufRoot: AbsoluteFilePath.of(`/workspace/${name}`),
        absoluteFilepathToProtobufTarget:
            target == null ? undefined : AbsoluteFilePath.of(`/workspace/${name}/${target}`),
        absoluteFilepathToOverrides: [AbsoluteFilePath.of(`/workspace/${name}-overrides.yml`)],
        relativeFilepathToProtobufRoot: RelativeFilePath.of(name),
        generateLocally: true,
        fromOpenAPI,
        dependencies: []
    };
}

function convertedFrom(spec: ProtobufSpec, files: string[]): OpenAPISpec[] {
    return files.map((file) => ({
        type: "openapi",
        absoluteFilepath: AbsoluteFilePath.of(`/tmp/${file.replace(/\W/g, "-")}.yaml`),
        absoluteFilepathToOverrides: spec.absoluteFilepathToOverrides,
        absoluteFilepathToOverlays: undefined,
        source: {
            type: "protobuf",
            root: spec.absoluteFilepathToProtobufRoot,
            file: AbsoluteFilePath.of(`${spec.absoluteFilepathToProtobufRoot}/${file}`)
        }
    }));
}

function logger() {
    return { warn: vi.fn() };
}

describe("prepareSdkSourceSpecs", () => {
    it("replaces a proto-only workspace's spec with its converted OpenAPI", async () => {
        const orders = proto("orders", { target: "orders/v1/orders.proto" });
        const output = convertedFrom(orders, ["orders/v1/orders.proto"]);
        const convert = vi.fn(async () => [{ protobufSpec: orders, openApiSpecs: output }]);

        const prepared = await prepareSdkSourceSpecs({ specs: [orders], convert, logger: logger() });

        expect(convert).toHaveBeenCalledWith([orders]);
        expect(prepared).toEqual([
            { spec: output[0], sourceIndex: 0, protobuf: { relativeFilePath: "orders/v1/orders.proto", fileCount: 1 } }
        ]);
    });

    it("keeps definition order when protos and OpenAPI are mixed", async () => {
        const before = openapi("before");
        const orders = proto("orders", { target: "orders.proto" });
        const after = openapi("after");
        const output = convertedFrom(orders, ["orders.proto"]);

        const prepared = await prepareSdkSourceSpecs({
            specs: [before, orders, after],
            convert: async () => [{ protobufSpec: orders, openApiSpecs: output }],
            logger: logger()
        });

        expect(prepared.map(({ spec, sourceIndex }) => [spec, sourceIndex])).toEqual([
            [before, 0],
            [output[0], 1],
            [after, 2]
        ]);
    });

    it("expands a proto without a target into one source per converted file", async () => {
        const orders = proto("orders");
        const output = convertedFrom(orders, ["a/v1/a.proto", "b/v1/b.proto"]);

        const prepared = await prepareSdkSourceSpecs({
            specs: [orders],
            convert: async () => [{ protobufSpec: orders, openApiSpecs: output }],
            logger: logger()
        });

        expect(prepared).toEqual([
            { spec: output[0], sourceIndex: 0, protobuf: { relativeFilePath: "a/v1/a.proto", fileCount: 2 } },
            { spec: output[1], sourceIndex: 0, protobuf: { relativeFilePath: "b/v1/b.proto", fileCount: 2 } }
        ]);
        // Overrides are forwarded on every converted file, not applied.
        expect(prepared.map(({ spec }) => spec.type === "openapi" && spec.absoluteFilepathToOverrides)).toEqual([
            orders.absoluteFilepathToOverrides,
            orders.absoluteFilepathToOverrides
        ]);
    });

    it("drops docs-only protos with a warning and does not convert them", async () => {
        const plain = openapi("plain");
        const docs = proto("docs", { fromOpenAPI: false, target: "docs.proto" });
        const log = logger();
        const convert = vi.fn(async () => []);

        const prepared = await prepareSdkSourceSpecs({ specs: [docs, plain], convert, logger: log });

        expect(prepared).toEqual([{ spec: plain, sourceIndex: 1 }]);
        expect(convert).not.toHaveBeenCalled();
        expect(log.warn).toHaveBeenCalledWith(
            "proto spec /workspace/docs/docs.proto is docs-only (from-openapi is false); set from-openapi: true to include it in the SDK."
        );
    });

    it("fails when every source is a docs-only proto", async () => {
        await expect(
            prepareSdkSourceSpecs({
                specs: [proto("docs", { fromOpenAPI: false })],
                convert: async () => [],
                logger: logger()
            })
        ).rejects.toThrow("every protobuf spec is docs-only");
    });

    it("fails when the converter does not return a selected proto", async () => {
        await expect(
            prepareSdkSourceSpecs({ specs: [proto("orders")], convert: async () => [], logger: logger() })
        ).rejects.toThrow("was not converted");
    });
});

describe("rewriteSdkConfigSourceSpecs", () => {
    const plainConfigured: SdkConfigV1SourceSpec = {
        id: "plain",
        type: "openapi",
        path: "./plain.yml",
        namespace: "plain",
        overrides: ["./plain-overrides.yml"]
    };
    const protoConfigured: SdkConfigV1SourceSpec = {
        id: "orders",
        name: "Orders",
        namespace: "ignored",
        apiImportSettings: { respectNullableSchemas: true },
        proto: { root: "./orders", overrides: ["./orders-overrides.yml"], fromOpenApi: true }
    };

    function entry(specPath: string, origin?: "protobuf"): RawSpecsManifestEntry {
        return { type: "openapi", specPath, ...(origin == null ? {} : { origin }) };
    }

    function sources(...items: Array<Partial<SdkSourceSpec> & { sourceIndex: number }>): SdkSourceSpec[] {
        return items.map((item) => ({ spec: openapi("x") as Spec, ...item }));
    }

    it("keeps plain specs and replaces a single-file proto with an OpenAPI spec of the same id", () => {
        expect(
            rewriteSdkConfigSourceSpecs({
                configuredSpecs: [plainConfigured, protoConfigured],
                sources: sources(
                    { sourceIndex: 0 },
                    { sourceIndex: 1, protobuf: { relativeFilePath: "orders.proto", fileCount: 1 } }
                ),
                manifestEntries: [entry("/fern/specs/openapi0.json"), entry("/fern/specs/openapi1.json", "protobuf")]
            })
        ).toEqual([
            plainConfigured,
            {
                id: "orders",
                type: "openapi",
                path: "fern/specs/openapi1.json",
                name: "Orders",
                apiImportSettings: { respectNullableSchemas: true }
            }
        ]);
    });

    it("gives each file of a multi-file proto its own id", () => {
        const rewritten = rewriteSdkConfigSourceSpecs({
            configuredSpecs: [protoConfigured],
            sources: sources(
                { sourceIndex: 0, protobuf: { relativeFilePath: "a/v1/a.proto", fileCount: 2 } },
                { sourceIndex: 0, protobuf: { relativeFilePath: "b/v1/b.proto", fileCount: 2 } }
            ),
            manifestEntries: [
                entry("/fern/specs/openapi0.json", "protobuf"),
                entry("/fern/specs/openapi1.json", "protobuf")
            ]
        });

        expect(rewritten.map((spec) => spec.id)).toEqual(["orders:a/v1/a.proto", "orders:b/v1/b.proto"]);
        expect(rewritten.map((spec) => ("path" in spec ? spec.path : undefined))).toEqual([
            "fern/specs/openapi0.json",
            "fern/specs/openapi1.json"
        ]);
    });

    it("suffixes a generated id that collides with another source id", () => {
        const rewritten = rewriteSdkConfigSourceSpecs({
            configuredSpecs: [{ ...plainConfigured, id: "orders:a.proto" }, protoConfigured],
            sources: sources(
                { sourceIndex: 0 },
                { sourceIndex: 1, protobuf: { relativeFilePath: "a.proto", fileCount: 2 } },
                { sourceIndex: 1, protobuf: { relativeFilePath: "b.proto", fileCount: 2 } }
            ),
            manifestEntries: [
                entry("/fern/specs/openapi0.json"),
                entry("/fern/specs/openapi1.json", "protobuf"),
                entry("/fern/specs/openapi2.json", "protobuf")
            ]
        });

        expect(rewritten.map((spec) => spec.id)).toEqual(["orders:a.proto", "orders:a.proto-2", "orders:b.proto"]);
    });

    it("refuses sources and manifest entries that do not line up", () => {
        expect(() =>
            rewriteSdkConfigSourceSpecs({
                configuredSpecs: [plainConfigured],
                sources: sources({ sourceIndex: 0 }),
                manifestEntries: []
            })
        ).toThrow("1 SDK sources but 0 manifest entries");
        expect(() =>
            rewriteSdkConfigSourceSpecs({
                configuredSpecs: [plainConfigured],
                sources: sources({ sourceIndex: 3 }),
                manifestEntries: [entry("/fern/specs/openapi0.json")]
            })
        ).toThrow("source spec 3");
    });
});
