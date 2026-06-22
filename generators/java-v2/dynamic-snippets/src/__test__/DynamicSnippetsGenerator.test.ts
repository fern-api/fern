import { DynamicSnippetsTestRunner } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

describe("snippets (default)", () => {
    const runner = new DynamicSnippetsTestRunner();
    runner.runTests({
        buildGenerator: ({ irFilepath }) =>
            buildDynamicSnippetsGenerator({ irFilepath, config: buildGeneratorConfig() })
    });
});

const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
);

/**
 * `exported-client-class-name` is the name customers want surfaced in docs snippets (e.g. a
 * hand-written wrapper around the generated client). It must override `client-class-name` for
 * snippet output only, while falling back to `client-class-name` (and then the default) when unset.
 */
describe("snippets (exported-client-class-name)", () => {
    const createMovieRequest: FernIr.dynamic.EndpointSnippetRequest = {
        endpoint: {
            method: "POST",
            path: "/movies/create-movie"
        },
        baseURL: undefined,
        environment: undefined,
        auth: {
            type: "bearer",
            token: "<YOUR_API_KEY>"
        },
        pathParameters: undefined,
        queryParameters: undefined,
        headers: undefined,
        requestBody: {
            title: "The Matrix",
            rating: 8.2
        }
    };

    test("exported-client-class-name overrides client-class-name in the generated snippet", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "imdb.json")),
            config: buildGeneratorConfig({
                customConfig: {
                    "client-class-name": "BaseAcme",
                    "exported-client-class-name": "AcmeClient"
                }
            })
        });

        const response = await generator.generate(createMovieRequest);

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toBeTruthy();
        const snippet = response.snippet ?? "";
        // Docs surfaces must instantiate/build the exported name...
        expect(snippet).toContain("AcmeClient client = AcmeClient");
        // ...and must never leak the internal client-class-name.
        expect(snippet).not.toContain("BaseAcme");
    });

    test("falls back to client-class-name when exported-client-class-name is unset", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "imdb.json")),
            config: buildGeneratorConfig({
                customConfig: {
                    "client-class-name": "BaseAcme"
                }
            })
        });

        const response = await generator.generate(createMovieRequest);

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toBeTruthy();
        const snippet = response.snippet ?? "";
        expect(snippet).toContain("BaseAcme client = BaseAcme");
    });
});

/**
 * Inline type naming: when `enable-inline-types` is on and `inlineTypeIds` is supplied, the
 * dynamic snippet generator must reference nested classes (e.g. `DiscriminatedUnion1.Type1`)
 * rather than the flat top-level names the dynamic IR would otherwise produce
 * (e.g. `DiscriminatedUnion1InlineType1`).
 *
 * The `inlineTypeIds` set normally comes from the full IR (computed in SdkGeneratorCli) and is
 * threaded through the generator. In tests we supply it directly so we can exercise the naming
 * logic without running the full Java v1 generator.
 */
describe("snippets (inline type naming)", () => {
    // The type IDs that v1 emits as nested classes for the java-inline-types fixture when
    // enable-inline-types is true. These match the dynamic IR type IDs (same namespace).
    const inlineTypeIds = new Set([
        "type_:RequestTypeInlineType1",
        "type_:RootType1",
        "type_:RootType1FooMapValue",
        "type_:RootType1FooListItem",
        "type_:RootType1FooSetItem",
        "type_:RootType1InlineType1",
        "type_:RootType1InlineType1NestedInlineType1",
        "type_:DiscriminatedUnion1InlineType1",
        "type_:DiscriminatedUnion1InlineType1InlineType1",
        "type_:DiscriminatedUnion1InlineType2",
        "type_:UndiscriminatedUnion1InlineType1",
        "type_:UndiscriminatedUnion1InlineType1InlineType1",
        "type_:UndiscriminatedUnion1InlineType2",
        "type_:InlineEnum1",
        "type_:UndiscriminatedUnion1DiscriminatedUnion1InlineType1",
        "type_:UndiscriminatedUnion1DiscriminatedUnion1InlineType1InlineType1",
        "type_:UndiscriminatedUnion1DiscriminatedUnion1InlineType2",
        "type_:UndiscriminatedUnion1InlineEnum1",
        "type_:UndiscriminatedUnion1InlineListItem1",
        "type_:UndiscriminatedUnion1InlineSetItem1",
        "type_:UndiscriminatedUnion1InlineMapItem1",
        "type_:MapResponseValue",
        "type_:MapResponseValueNested",
        "type_:AliasInlineValue"
    ]);

    function buildInlineGenerator(): ReturnType<typeof buildDynamicSnippetsGenerator> {
        return buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "java-inline-types.json")),
            config: buildGeneratorConfig({
                customConfig: {
                    "enable-inline-types": true,
                    "wrapped-aliases": true
                }
            }),
            inlineTypeIds
        });
    }

    test("discriminated union variant uses nested class name (DiscriminatedUnion1.Type1), not flat top-level name", async () => {
        const generator = buildInlineGenerator();

        const response = await generator.generate({
            endpoint: { method: "POST", path: "/root/discriminated-union" },
            baseURL: undefined,
            environment: undefined,
            auth: undefined,
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: {
                bar: {
                    type: "type1",
                    foo: "foo",
                    // DiscriminatedUnion1InlineType1InlineType1 has foo + ref (no bar)
                    bar: { foo: "foo", ref: { foo: "foo" } },
                    ref: { foo: "foo" }
                },
                foo: "foo"
            }
        });

        expect(response.errors).toBeUndefined();
        const snippet = response.snippet ?? "";
        // v1 nests the variant type as DiscriminatedUnion1.Type1, not the flat DiscriminatedUnion1InlineType1
        expect(snippet).toContain("DiscriminatedUnion1.Type1");
        expect(snippet).not.toContain("DiscriminatedUnion1InlineType1");
    });

    test("object inline property uses nested class name (PostRootRequest.Bar), not flat top-level name", async () => {
        const generator = buildInlineGenerator();

        const response = await generator.generate({
            endpoint: { method: "POST", path: "/root/root" },
            baseURL: undefined,
            environment: undefined,
            auth: undefined,
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: {
                bar: { foo: "foo" },
                foo: "foo"
            }
        });

        expect(response.errors).toBeUndefined();
        const snippet = response.snippet ?? "";
        // The `bar` property of PostRootRequest is an inline type; v1 names it PostRootRequest.Bar
        expect(snippet).toContain("PostRootRequest.Bar");
        expect(snippet).not.toContain("RequestTypeInlineType1");
    });

    test("without inlineTypeIds flat names are used (regression guard)", async () => {
        // When inlineTypeIds is not supplied (empty), the generator must fall back to the
        // top-level dynamic-IR names so existing users without inline types are unaffected.
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "java-inline-types.json")),
            config: buildGeneratorConfig({
                customConfig: {
                    "enable-inline-types": true,
                    "wrapped-aliases": true
                }
            })
            // No inlineTypeIds — should behave as before the fix
        });

        const response = await generator.generate({
            endpoint: { method: "POST", path: "/root/root" },
            baseURL: undefined,
            environment: undefined,
            auth: undefined,
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: {
                bar: { foo: "foo" },
                foo: "foo"
            }
        });

        const snippet = response.snippet ?? "";
        // Without inlineTypeIds, the flat declaration name is used
        expect(snippet).toContain("RequestTypeInlineType1");
        expect(snippet).not.toContain("PostRootRequest.Bar");
    });
});
