import type {
    GlobalParameter,
    HttpEndpoint,
    HttpRequestBody,
    IntermediateRepresentation,
    TypeDeclaration,
    TypeReference
} from "@fern-api/ir-sdk";

import { resolveGlobalParameterApplicability } from "../global-parameters/resolveGlobalParameterApplicability.js";

// --- minimal builders (only the fields the resolver reads) ---

function unknownType(): TypeReference {
    return { type: "unknown" } as unknown as TypeReference;
}

function stringType(): TypeReference {
    return { type: "primitive" } as unknown as TypeReference;
}

function named(typeId: string): TypeReference {
    return { type: "named", typeId } as unknown as TypeReference;
}

function optional(inner: TypeReference): TypeReference {
    return { type: "container", container: { type: "optional", optional: inner } } as unknown as TypeReference;
}

function listOf(inner: TypeReference): TypeReference {
    return { type: "container", container: { type: "list", list: inner } } as unknown as TypeReference;
}

function objectType({
    properties,
    extendsTypeIds = []
}: {
    properties: Record<string, TypeReference>;
    extendsTypeIds?: string[];
}): TypeDeclaration {
    return {
        shape: {
            type: "object",
            extends: extendsTypeIds.map((typeId) => ({ typeId })),
            properties: Object.entries(properties).map(([name, valueType]) => ({ name, valueType }))
        }
    } as unknown as TypeDeclaration;
}

function aliasType(aliasOf: TypeReference): TypeDeclaration {
    return { shape: { type: "alias", aliasOf } } as unknown as TypeDeclaration;
}

function inlinedBody(properties: Record<string, TypeReference>): HttpRequestBody {
    return {
        type: "inlinedRequestBody",
        extends: [],
        properties: Object.entries(properties).map(([name, valueType]) => ({ name, valueType }))
    } as unknown as HttpRequestBody;
}

function referenceBody(requestBodyType: TypeReference): HttpRequestBody {
    return { type: "reference", requestBodyType } as unknown as HttpRequestBody;
}

function globalParam(param: {
    id: string;
    location: GlobalParameter["location"];
    target: string;
    apply?: GlobalParameter["apply"];
}): GlobalParameter {
    return param as unknown as GlobalParameter;
}

function endpoint({
    id,
    optIns = [],
    requestBody,
    pathParameters = [],
    headers = [],
    queryParameters = []
}: {
    id: string;
    optIns?: string[];
    requestBody?: HttpRequestBody;
    pathParameters?: string[];
    headers?: string[];
    queryParameters?: string[];
}): HttpEndpoint {
    return {
        id,
        globalParameters: optIns,
        requestBody,
        allPathParameters: pathParameters.map((name) => ({ name })),
        headers: headers.map((name) => ({ name })),
        queryParameters: queryParameters.map((name) => ({ name }))
    } as unknown as HttpEndpoint;
}

function resolve({
    globalParameters,
    endpoints,
    types = {},
    serviceHeaders = []
}: {
    globalParameters: GlobalParameter[];
    endpoints: HttpEndpoint[];
    types?: Record<string, TypeDeclaration>;
    serviceHeaders?: string[];
}): { endpoints: HttpEndpoint[]; warnings: string[] } {
    const warnings: string[] = [];
    const ir = {
        globalParameters,
        services: { service_root: { endpoints, headers: serviceHeaders.map((name) => ({ name })) } },
        types
    } as unknown as IntermediateRepresentation;
    resolveGlobalParameterApplicability(ir, { onWarning: (message) => warnings.push(message) });
    return { endpoints, warnings };
}

describe("resolveGlobalParameterApplicability", () => {
    it("no-ops when there are no global parameters", () => {
        const ep = endpoint({ id: "e", optIns: ["ghost"] });
        resolve({ globalParameters: [], endpoints: [ep] });
        expect(ep.globalParameters).toEqual(["ghost"]);
    });

    describe("body location", () => {
        it("includes an auto body param when the inlined body contains the target", () => {
            const ep = endpoint({ id: "e", requestBody: inlinedBody({ config: named("Config") }) });
            const { endpoints } = resolve({
                globalParameters: [
                    globalParam({ id: "currency", location: "body", target: "config.currency", apply: "auto" })
                ],
                endpoints: [ep],
                types: { Config: objectType({ properties: { currency: stringType() } }) }
            });
            expect(endpoints[0]?.globalParameters).toEqual(["currency"]);
        });

        it("excludes an auto body param when the body does not contain the target", () => {
            const ep = endpoint({ id: "e", requestBody: inlinedBody({ query: stringType() }) });
            const { endpoints } = resolve({
                globalParameters: [
                    globalParam({ id: "currency", location: "body", target: "config.currency", apply: "auto" })
                ],
                endpoints: [ep],
                types: {}
            });
            expect(endpoints[0]?.globalParameters).toBeUndefined();
        });

        it("excludes an auto body param on an endpoint with no request body", () => {
            const ep = endpoint({ id: "e" });
            const { endpoints } = resolve({
                globalParameters: [
                    globalParam({ id: "currency", location: "body", target: "config.currency", apply: "auto" })
                ],
                endpoints: [ep]
            });
            expect(endpoints[0]?.globalParameters).toBeUndefined();
        });

        it("keeps an explicit body opt-in when the schema contains the target", () => {
            const ep = endpoint({
                id: "e",
                optIns: ["tenant"],
                requestBody: inlinedBody({ metadata: named("Meta") })
            });
            const { endpoints, warnings } = resolve({
                globalParameters: [
                    globalParam({ id: "tenant", location: "body", target: "metadata.tenantId", apply: "explicit" })
                ],
                endpoints: [ep],
                types: { Meta: objectType({ properties: { tenantId: stringType() } }) }
            });
            expect(endpoints[0]?.globalParameters).toEqual(["tenant"]);
            expect(warnings).toHaveLength(0);
        });

        it("drops an explicit body opt-in with a warning when the schema lacks the target", () => {
            const ep = endpoint({
                id: "endpoint_products.create",
                optIns: ["tenant"],
                requestBody: inlinedBody({ query: stringType() })
            });
            const { endpoints, warnings } = resolve({
                globalParameters: [
                    globalParam({ id: "tenant", location: "body", target: "metadata.tenantId", apply: "explicit" })
                ],
                endpoints: [ep]
            });
            expect(endpoints[0]?.globalParameters).toBeUndefined();
            expect(warnings).toHaveLength(1);
            expect(warnings[0]).toContain("endpoint_products.create");
            expect(warnings[0]).toContain("tenant");
            expect(warnings[0]).toContain("metadata.tenantId");
        });

        it("does not include a body param that is neither auto nor opted into", () => {
            const ep = endpoint({ id: "e", requestBody: inlinedBody({ config: named("Config") }) });
            const { endpoints } = resolve({
                globalParameters: [
                    globalParam({ id: "currency", location: "body", target: "config.currency", apply: "explicit" })
                ],
                endpoints: [ep],
                types: { Config: objectType({ properties: { currency: stringType() } }) }
            });
            expect(endpoints[0]?.globalParameters).toBeUndefined();
        });

        it("resolves a target through an optional-wrapped nested object", () => {
            const ep = endpoint({ id: "e", requestBody: inlinedBody({ config: optional(named("Config")) }) });
            const { endpoints } = resolve({
                globalParameters: [
                    globalParam({ id: "currency", location: "body", target: "config.currency", apply: "auto" })
                ],
                endpoints: [ep],
                types: { Config: objectType({ properties: { currency: stringType() } }) }
            });
            expect(endpoints[0]?.globalParameters).toEqual(["currency"]);
        });

        it("does not descend into a list container", () => {
            const ep = endpoint({ id: "e", requestBody: inlinedBody({ items: listOf(named("Config")) }) });
            const { endpoints } = resolve({
                globalParameters: [
                    globalParam({ id: "currency", location: "body", target: "items.currency", apply: "auto" })
                ],
                endpoints: [ep],
                types: { Config: objectType({ properties: { currency: stringType() } }) }
            });
            expect(endpoints[0]?.globalParameters).toBeUndefined();
        });

        it("resolves inherited properties via an inlined body's extends (OpenAPI path, no extendedProperties)", () => {
            const ep = endpoint({ id: "e", requestBody: inlinedBody({ query: stringType() }) });
            // Simulate the OpenAPI importer: inlined body declares `extends` but leaves
            // `extendedProperties` empty. The inherited `config.currency` must still resolve.
            const body = ep.requestBody as unknown as { extends: { typeId: string }[] };
            body.extends = [{ typeId: "Base" }];
            const { endpoints } = resolve({
                globalParameters: [
                    globalParam({ id: "currency", location: "body", target: "config.currency", apply: "auto" })
                ],
                endpoints: [ep],
                types: {
                    Base: objectType({ properties: { config: named("Config") } }),
                    Config: objectType({ properties: { currency: stringType() } })
                }
            });
            expect(endpoints[0]?.globalParameters).toEqual(["currency"]);
        });

        it("resolves inherited properties via extends", () => {
            const ep = endpoint({ id: "e", requestBody: referenceBody(named("Child")) });
            const { endpoints } = resolve({
                globalParameters: [globalParam({ id: "tenant", location: "body", target: "tenantId", apply: "auto" })],
                endpoints: [ep],
                types: {
                    Child: objectType({ properties: { name: stringType() }, extendsTypeIds: ["Base"] }),
                    Base: objectType({ properties: { tenantId: stringType() } })
                }
            });
            expect(endpoints[0]?.globalParameters).toEqual(["tenant"]);
        });

        it("follows aliases when resolving a reference body", () => {
            const ep = endpoint({ id: "e", requestBody: referenceBody(named("BodyAlias")) });
            const { endpoints } = resolve({
                globalParameters: [
                    globalParam({ id: "currency", location: "body", target: "config.currency", apply: "auto" })
                ],
                endpoints: [ep],
                types: {
                    BodyAlias: aliasType(named("Body")),
                    Body: objectType({ properties: { config: named("Config") } }),
                    Config: objectType({ properties: { currency: stringType() } })
                }
            });
            expect(endpoints[0]?.globalParameters).toEqual(["currency"]);
        });

        it("resolves a path that descends through a recursive type more than once", () => {
            const ep = endpoint({ id: "e", requestBody: referenceBody(named("Node")) });
            const { endpoints } = resolve({
                globalParameters: [
                    globalParam({ id: "deep", location: "body", target: "next.next.value", apply: "auto" })
                ],
                endpoints: [ep],
                types: {
                    Node: objectType({ properties: { next: named("Node"), value: stringType() } })
                }
            });
            // `next.next.value` is a finite, structurally-present path through the recursive
            // `Node` type — the cycle guard must not produce a false negative here.
            expect(endpoints[0]?.globalParameters).toEqual(["deep"]);
        });

        it("terminates (returns not-found) on a self-referential alias cycle within one segment", () => {
            const ep = endpoint({ id: "e", requestBody: referenceBody(named("A")) });
            const { endpoints } = resolve({
                globalParameters: [globalParam({ id: "missing", location: "body", target: "value", apply: "auto" })],
                endpoints: [ep],
                types: {
                    // A -> B -> A is a segment-less loop; it must terminate rather than hang.
                    A: aliasType(named("B")),
                    B: aliasType(named("A"))
                }
            });
            expect(endpoints[0]?.globalParameters).toBeUndefined();
        });
    });

    describe("header / query location", () => {
        it("applies an auto query param only to endpoints declaring that query parameter", () => {
            const withParam = endpoint({ id: "with", queryParameters: ["lang"] });
            const withoutParam = endpoint({ id: "without", queryParameters: ["other"] });
            const { endpoints } = resolve({
                globalParameters: [globalParam({ id: "lang", location: "query", target: "lang", apply: "auto" })],
                endpoints: [withParam, withoutParam]
            });
            expect(endpoints[0]?.globalParameters).toEqual(["lang"]);
            expect(endpoints[1]?.globalParameters).toBeUndefined();
        });

        it("applies an auto header param only to endpoints declaring that header (case-insensitive)", () => {
            const withHeader = endpoint({ id: "with", headers: ["X-Trace-Id"] });
            const withoutHeader = endpoint({ id: "without", headers: ["X-Other"] });
            const { endpoints } = resolve({
                globalParameters: [
                    globalParam({ id: "trace", location: "header", target: "x-trace-id", apply: "auto" })
                ],
                endpoints: [withHeader, withoutHeader]
            });
            expect(endpoints[0]?.globalParameters).toEqual(["trace"]);
            expect(endpoints[1]?.globalParameters).toBeUndefined();
        });

        it("matches a header declared at the service level", () => {
            const ep = endpoint({ id: "e" });
            const { endpoints } = resolve({
                globalParameters: [
                    globalParam({ id: "trace", location: "header", target: "X-Trace-Id", apply: "auto" })
                ],
                endpoints: [ep],
                serviceHeaders: ["X-Trace-Id"]
            });
            expect(endpoints[0]?.globalParameters).toEqual(["trace"]);
        });

        it("applies an explicit query param only where opted in AND declared", () => {
            const optedInAndDeclared = endpoint({ id: "in", optIns: ["lang"], queryParameters: ["lang"] });
            const declaredNotOptedIn = endpoint({ id: "declared", queryParameters: ["lang"] });
            const { endpoints, warnings } = resolve({
                globalParameters: [globalParam({ id: "lang", location: "query", target: "lang", apply: "explicit" })],
                endpoints: [optedInAndDeclared, declaredNotOptedIn]
            });
            expect(endpoints[0]?.globalParameters).toEqual(["lang"]);
            expect(endpoints[1]?.globalParameters).toBeUndefined();
            expect(warnings).toHaveLength(0);
        });

        it("drops an explicit query opt-in with a warning when the endpoint does not declare the parameter", () => {
            const ep = endpoint({ id: "endpoint_x", optIns: ["lang"], queryParameters: ["other"] });
            const { endpoints, warnings } = resolve({
                globalParameters: [globalParam({ id: "lang", location: "query", target: "lang", apply: "explicit" })],
                endpoints: [ep]
            });
            expect(endpoints[0]?.globalParameters).toBeUndefined();
            expect(warnings).toHaveLength(1);
            expect(warnings[0]).toContain("endpoint_x");
            expect(warnings[0]).toContain("lang");
            expect(warnings[0]).toContain("query parameter");
        });

        it("treats a missing apply mode as explicit (requires opt-in and match)", () => {
            const declaredNoOptIn = endpoint({ id: "e", queryParameters: ["lang"] });
            const { endpoints } = resolve({
                globalParameters: [globalParam({ id: "lang", location: "query", target: "lang" })],
                endpoints: [declaredNoOptIn]
            });
            expect(endpoints[0]?.globalParameters).toBeUndefined();
        });
    });

    describe("always apply mode", () => {
        it("applies an always query param to every endpoint regardless of declaration", () => {
            const declared = endpoint({ id: "declared", queryParameters: ["lang"] });
            const undeclared = endpoint({ id: "undeclared" });
            const { endpoints } = resolve({
                globalParameters: [globalParam({ id: "lang", location: "query", target: "lang", apply: "always" })],
                endpoints: [declared, undeclared]
            });
            expect(endpoints[0]?.globalParameters).toEqual(["lang"]);
            expect(endpoints[1]?.globalParameters).toEqual(["lang"]);
        });

        it("applies an always header param to every endpoint regardless of declaration", () => {
            const ep = endpoint({ id: "e" });
            const { endpoints } = resolve({
                globalParameters: [
                    globalParam({ id: "trace", location: "header", target: "X-Trace-Id", apply: "always" })
                ],
                endpoints: [ep]
            });
            expect(endpoints[0]?.globalParameters).toEqual(["trace"]);
        });
    });

    describe("path location", () => {
        it("applies an auto path param only to endpoints declaring the path parameter", () => {
            const withParam = endpoint({ id: "with", pathParameters: ["regionId"] });
            const withoutParam = endpoint({ id: "without", pathParameters: ["orgId"] });
            const { endpoints } = resolve({
                globalParameters: [globalParam({ id: "region", location: "path", target: "regionId", apply: "auto" })],
                endpoints: [withParam, withoutParam]
            });
            expect(endpoints[0]?.globalParameters).toEqual(["region"]);
            expect(endpoints[1]?.globalParameters).toBeUndefined();
        });

        it("keeps an explicit path opt-in only when the path declares the parameter", () => {
            const ep = endpoint({ id: "e", optIns: ["region"], pathParameters: ["regionId"] });
            const { endpoints, warnings } = resolve({
                globalParameters: [
                    globalParam({ id: "region", location: "path", target: "regionId", apply: "explicit" })
                ],
                endpoints: [ep]
            });
            expect(endpoints[0]?.globalParameters).toEqual(["region"]);
            expect(warnings).toHaveLength(0);
        });

        it("drops an explicit path opt-in with a warning when the path does not declare the parameter", () => {
            const ep = endpoint({ id: "endpoint_y", optIns: ["region"], pathParameters: [] });
            const { endpoints, warnings } = resolve({
                globalParameters: [
                    globalParam({ id: "region", location: "path", target: "regionId", apply: "explicit" })
                ],
                endpoints: [ep]
            });
            expect(endpoints[0]?.globalParameters).toBeUndefined();
            expect(warnings).toHaveLength(1);
            expect(warnings[0]).toContain("endpoint_y");
            expect(warnings[0]).toContain("path parameter");
        });
    });

    it("preserves global-parameter declaration order in the resolved set", () => {
        const ep = endpoint({ id: "e", optIns: ["b"], queryParameters: ["a", "b"], headers: ["c"] });
        const { endpoints } = resolve({
            globalParameters: [
                globalParam({ id: "a", location: "query", target: "a", apply: "auto" }),
                globalParam({ id: "b", location: "query", target: "b", apply: "explicit" }),
                globalParam({ id: "c", location: "header", target: "c", apply: "auto" })
            ],
            endpoints: [ep]
        });
        expect(endpoints[0]?.globalParameters).toEqual(["a", "b", "c"]);
    });
});
