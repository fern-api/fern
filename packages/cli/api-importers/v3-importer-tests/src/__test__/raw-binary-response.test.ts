import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
const EXPECTED_RAW_BINARY_BEHAVIOR = {
    responses: {
        inlineZip: "fileDownload",
        referencedZip: "fileDownload",
        referencedPdf: "fileDownload",
        text: "text",
        svgXml: "fileDownload"
    },
    schemas: {
        rawZip: { v1: "STRING", v2: "string", format: "binary" },
        rawPdf: { v1: "STRING", v2: "string", format: "binary" },
        typedUnencodedZip: { v1: "STRING", v2: "string", format: undefined },
        untypedEncodedZip: "unknown",
        conflictingFormatZip: "unknown",
        text: "unknown",
        svgXml: "unknown",
        structuredZip: "object"
    }
};

describe("OpenAPI 3.1 raw binary data", () => {
    it("uses binary media types in the current importer", async () => {
        expect(getRawBinaryBehavior(await getIRForFixture("raw-binary-response"))).toEqual(
            EXPECTED_RAW_BINARY_BEHAVIOR
        );
    }, 90_000);

    it("uses binary media types in workspace conversion", async () => {
        expect(getRawBinaryBehavior(await getBaselineIRForFixture("raw-binary-response"))).toEqual(
            EXPECTED_RAW_BINARY_BEHAVIOR
        );
    }, 90_000);
});

type IR = Awaited<ReturnType<typeof getIRForFixture>>;

function getRawBinaryBehavior(ir: IR) {
    return {
        responses: {
            inlineZip: findEndpointByOperationId(ir, "downloadArchive")?.response?.body?.type,
            referencedZip: findEndpointByOperationId(ir, "downloadComponentArchive")?.response?.body?.type,
            referencedPdf: findEndpointByOperationId(ir, "downloadReport")?.response?.body?.type,
            text: findEndpointByOperationId(ir, "getReadme")?.response?.body?.type,
            svgXml: findEndpointByOperationId(ir, "getDiagram")?.response?.body?.type
        },
        schemas: {
            rawZip: getAliasPrimitiveTarget(ir, "RawZip"),
            rawPdf: getAliasPrimitiveTarget(ir, "RawPdf"),
            typedUnencodedZip: getAliasPrimitiveTarget(ir, "TypedUnencodedZip"),
            untypedEncodedZip: getAliasTargetType(ir, "UntypedEncodedZip"),
            conflictingFormatZip: getAliasTargetType(ir, "ConflictingFormatZip"),
            text: getAliasTargetType(ir, "RawText"),
            svgXml: getAliasTargetType(ir, "SvgXml"),
            structuredZip: findType(ir, "StructuredZip")?.shape.type
        }
    };
}

function getAliasPrimitiveTarget(
    ir: IR,
    typeName: string
): { v1: string; v2: string | undefined; format: string | undefined } | undefined {
    const shape = findType(ir, typeName)?.shape;
    if (
        shape?.type !== "alias" ||
        shape.aliasOf.type !== "primitive" ||
        shape.aliasOf.primitive.v2?.type !== "string"
    ) {
        return undefined;
    }
    return {
        v1: shape.aliasOf.primitive.v1,
        v2: shape.aliasOf.primitive.v2.type,
        format: shape.aliasOf.primitive.v2.validation?.format
    };
}

function getAliasTargetType(ir: IR, typeName: string): string | undefined {
    const shape = findType(ir, typeName)?.shape;
    return shape?.type === "alias" ? shape.aliasOf.type : undefined;
}

function findType(ir: IR, typeName: string): IR["types"][string] | undefined {
    return Object.values(ir.types).find((type) => type.name.name === typeName);
}

async function getIRForFixture(fixtureName: string) {
    const { context, workspace } = await loadFixture(fixtureName);
    return workspace.getIntermediateRepresentation({
        context,
        audiences: { type: "all" },
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: true,
        logWarnings: false
    });
}

async function getBaselineIRForFixture(fixtureName: string): Promise<IR> {
    const { context, workspace } = await loadFixture(fixtureName);
    const fernWorkspace = await workspace.toFernWorkspace({ context });
    return generateIntermediateRepresentation({
        workspace: fernWorkspace,
        generationLanguage: undefined,
        audiences: { type: "all" },
        keywords: undefined,
        smartCasing: true,
        exampleGeneration: { disabled: true },
        readme: undefined,
        version: undefined,
        packageName: undefined,
        context,
        sourceResolver: new SourceResolverImpl(context, fernWorkspace)
    });
}

async function loadFixture(fixtureName: string) {
    const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixtureName), RelativeFilePath.of("fern"));
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: fixturePath,
        context,
        cliVersion: "0.0.0",
        workspaceName: fixtureName
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load OpenAPI fixture ${fixtureName}\n${JSON.stringify(workspace.failures)}`);
    }
    if (!(workspace.workspace instanceof OSSWorkspace)) {
        throw new Error(`Expected OSSWorkspace for fixture ${fixtureName}`);
    }
    return { context, workspace: workspace.workspace };
}

function findEndpointByOperationId(
    ir: Awaited<ReturnType<typeof getIRForFixture>>,
    operationId: string
): (typeof ir.services)[string]["endpoints"][number] | undefined {
    for (const service of Object.values(ir.services)) {
        for (const endpoint of service.endpoints) {
            const originalName = typeof endpoint.name === "string" ? endpoint.name : endpoint.name.originalName;
            if (originalName === operationId) {
                return endpoint;
            }
        }
    }
    return undefined;
}
