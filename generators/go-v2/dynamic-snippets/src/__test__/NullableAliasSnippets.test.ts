import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const IR_FILEPATH = join(
    AbsoluteFilePath.of(__dirname),
    RelativeFilePath.of(
        "../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions/go-nullable-date-ref.json"
    )
);

const REPORT_TYPE_ID = "type_:Report";

function name(originalName: string, pascalCase: string): FernIr.dynamic.Name {
    const camelCase = pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
    const snakeCase = originalName;
    return {
        originalName,
        camelCase: { unsafeName: camelCase, safeName: camelCase },
        pascalCase: { unsafeName: pascalCase, safeName: pascalCase },
        snakeCase: { unsafeName: snakeCase, safeName: snakeCase },
        screamingSnakeCase: { unsafeName: snakeCase.toUpperCase(), safeName: snakeCase.toUpperCase() }
    };
}

/** Adds `type ChainedTags = NullableTags` and `type ChainedMetadata = NullableMetadata`, plus optional fields using them. */
function withChainedAliases(
    ir: FernIr.dynamic.DynamicIntermediateRepresentation
): FernIr.dynamic.DynamicIntermediateRepresentation {
    const report = ir.types[REPORT_TYPE_ID];
    if (report == null || report.type !== "object") {
        throw new Error(`Expected ${REPORT_TYPE_ID} to be an object`);
    }
    const chainedAlias = (pascalCase: string, targetTypeId: string): FernIr.dynamic.NamedType => ({
        type: "alias",
        declaration: {
            name: name(pascalCase, pascalCase),
            fernFilepath: { allParts: [], packagePath: [], file: undefined }
        },
        typeReference: { type: "named", value: targetTypeId }
    });
    const optionalProperty = (
        wireValue: string,
        pascalCase: string,
        typeId: string
    ): FernIr.dynamic.NamedParameter => ({
        name: { wireValue, name: name(wireValue, pascalCase) },
        typeReference: { type: "optional", value: { type: "named", value: typeId } }
    });
    return {
        ...ir,
        types: {
            ...ir.types,
            "type_:ChainedTags": chainedAlias("ChainedTags", "type_:NullableTags"),
            "type_:ChainedMetadata": chainedAlias("ChainedMetadata", "type_:NullableMetadata"),
            [REPORT_TYPE_ID]: {
                ...report,
                properties: [
                    ...report.properties,
                    optionalProperty("chained_tags", "ChainedTags", "type_:ChainedTags"),
                    optionalProperty("chained_metadata", "ChainedMetadata", "type_:ChainedMetadata")
                ]
            }
        }
    };
}

function createReport(requestBody: Record<string, unknown>): FernIr.dynamic.EndpointSnippetRequest {
    return {
        endpoint: { method: "POST", path: "/reports" },
        baseURL: undefined,
        environment: undefined,
        auth: undefined,
        pathParameters: undefined,
        queryParameters: undefined,
        headers: undefined,
        requestBody: { title: "title", created_date: "2023-01-15", ...requestBody }
    };
}

describe("nullable alias snippets", () => {
    it("addresses aliases of nullable collections reached through an alias chain", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig(),
            transformIr: withChainedAliases
        });

        const response = await generator.generate(
            createReport({ chained_tags: ["a", "b"], chained_metadata: { key: "value" } })
        );

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain("ChainedTags: &acme.ChainedTags{");
        expect(response.snippet).toContain("ChainedMetadata: &acme.ChainedMetadata{");
    });

    it("does not add a pointer to aliases that already render as pointers", async () => {
        const generator = buildDynamicSnippetsGenerator({ irFilepath: IR_FILEPATH, config: buildGeneratorConfig() });

        const response = await generator.generate(
            createReport({ tags_alias: ["a"], metadata_alias: { key: "value" }, description: "description" })
        );

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain("TagsAlias: &acme.NullableTags{");
        expect(response.snippet).toContain("MetadataAlias: &acme.NullableMetadata{");
        expect(response.snippet).toContain("Description: acme.String(");
        expect(response.snippet).not.toContain("&&");
    });

    it("takes the address of unknown alias values", async () => {
        const generator = buildDynamicSnippetsGenerator({ irFilepath: IR_FILEPATH, config: buildGeneratorConfig() });

        const response = await generator.generate(createReport({ extra: { key: "value" }, nullable_extra: "value" }));

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain("Extra: func() *acme.AnyValue {");
        expect(response.snippet).toContain("NullableExtra: func() *acme.NullableAnyValue {");
        expect(response.snippet).toContain("return &value");
    });
});
