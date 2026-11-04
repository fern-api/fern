import type { OpenAPISpec, ProtobufSpec } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OSSWorkspace } from "../OSSWorkspace.js";
import { convertProtobufSpecs } from "../utils/convertProtobufSpecs.js";
import { createMockTaskContext } from "./helpers/createMockTaskContext.js";

vi.mock("../utils/convertProtobufSpecs.js", () => ({ convertProtobufSpecs: vi.fn() }));

const WORKSPACE = AbsoluteFilePath.of("/workspace");

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

function proto(name: string, fromOpenAPI: boolean): ProtobufSpec {
    return {
        type: "protobuf",
        absoluteFilepathToProtobufRoot: AbsoluteFilePath.of(`/workspace/${name}`),
        absoluteFilepathToProtobufTarget: undefined,
        absoluteFilepathToOverrides: undefined,
        relativeFilepathToProtobufRoot: RelativeFilePath.of(name),
        generateLocally: true,
        fromOpenAPI,
        dependencies: []
    };
}

function workspace({
    plain,
    converted,
    docsOnly,
    sourceSpecs
}: {
    plain: OpenAPISpec;
    converted: ProtobufSpec;
    docsOnly: ProtobufSpec;
    sourceSpecs?: Array<OpenAPISpec | ProtobufSpec>;
}): OSSWorkspace {
    return new OSSWorkspace({
        absoluteFilePath: WORKSPACE,
        allSpecs: [plain, docsOnly],
        specs: [plain, converted],
        sourceSpecs,
        generatorsConfiguration: undefined,
        workspaceName: undefined,
        cliVersion: "0.0.0"
    });
}

describe("OSSWorkspace.getSdkSourceSpecs", () => {
    it("returns every spec in definition order, from-openapi protobuf specs included", async () => {
        const plain = openapi("plain");
        const converted = proto("orders", true);
        const docsOnly = proto("docs", false);

        const specs = await workspace({
            plain,
            converted,
            docsOnly,
            sourceSpecs: [converted, docsOnly, plain]
        }).getSdkSourceSpecs(undefined);

        expect(specs).toEqual([converted, docsOnly, plain]);
    });

    it("falls back to allSpecs followed by from-openapi protobuf specs", async () => {
        const plain = openapi("plain");
        const converted = proto("orders", true);
        const docsOnly = proto("docs", false);

        const specs = await workspace({ plain, converted, docsOnly }).getSdkSourceSpecs(undefined);

        expect(specs).toEqual([plain, docsOnly, converted]);
    });
});

describe("OSSWorkspace protobuf conversion cache", () => {
    beforeEach(() => {
        vi.mocked(convertProtobufSpecs).mockReset();
    });

    it("converts once for OpenAPI IR and SDK source preparation", async () => {
        const plain = openapi("plain");
        const converted = proto("orders", true);
        const output: OpenAPISpec = {
            ...openapi("converted"),
            source: {
                type: "protobuf",
                root: converted.absoluteFilepathToProtobufRoot,
                file: AbsoluteFilePath.of("/workspace/orders/orders.proto")
            }
        };
        vi.mocked(convertProtobufSpecs).mockResolvedValue([{ protobufSpec: converted, openApiSpecs: [output] }]);
        const ws = workspace({ plain, converted, docsOnly: proto("docs", false) });
        const context = createMockTaskContext();

        const conversions = await ws.getConvertedProtobufSpecsCached({ context });
        const openApiSpecs = await ws.getOpenAPISpecsCached({ context });
        const dependencySpecs = await ws.getOpenAPISpecsCached({
            context,
            relativePathToDependency: RelativeFilePath.of("dep")
        });

        expect(convertProtobufSpecs).toHaveBeenCalledTimes(1);
        expect(vi.mocked(convertProtobufSpecs).mock.calls[0]?.[0].specs).toEqual([converted]);
        expect(conversions).toEqual([{ protobufSpec: converted, openApiSpecs: [output] }]);
        expect(openApiSpecs.map((spec) => spec.absoluteFilepath)).toEqual([
            plain.absoluteFilepath,
            output.absoluteFilepath
        ]);
        expect(dependencySpecs[1]?.source).toMatchObject({ type: "protobuf", relativePathToDependency: "dep" });
    });
});
