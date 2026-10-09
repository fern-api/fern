import { GeneratorError, getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { ast, escapeForCSharpString, WithGeneration } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

type ExampleEndpointCall = FernIr.ExampleEndpointCall;
type ExampleRequestBody = FernIr.ExampleRequestBody;
type ExampleTypeReference = FernIr.ExampleTypeReference;
type HttpEndpoint = FernIr.HttpEndpoint;
type ObjectPropertyAccess = FernIr.ObjectPropertyAccess;
const ObjectPropertyAccess = FernIr.ObjectPropertyAccess;
type ObjectProperty = FernIr.ObjectProperty;
type TypeId = FernIr.TypeId;
type TypeReference = FernIr.TypeReference;

import { isEndpointSecurity } from "../../endpoint/request/endpointAuthHeaders.js";
import { getContentTypeFromRequestBody } from "../../endpoint/utils/getContentTypeFromRequestBody.js";
import { normalizePathSlashes } from "../../endpoint/utils/normalizePath.js";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

type AuthScheme = FernIr.AuthScheme;

/**
 * A single expected auth header matcher for a mock-server request.
 * - `present`: the header must be present with any value (used for schemes whose
 *   header value is resolved dynamically at runtime, e.g. OAuth/inferred tokens).
 * - `exact`: the header must be present with exactly this value.
 * - `absent`: the header must NOT be present on the request.
 */
type AuthHeaderMatcher =
    | { headerName: string; kind: "present" }
    | { headerName: string; kind: "exact"; value: string }
    | { headerName: string; kind: "absent" };

export declare namespace TestClass {
    interface TestInput {
        objectInstantiationSnippet: ast.CodeBlock;
        json: unknown;
    }
}

export class MockEndpointGenerator extends WithGeneration {
    constructor(private readonly context: SdkGeneratorContext) {
        super(context.generation);
    }

    public generateForExample(endpoint: HttpEndpoint, example: ExampleEndpointCall): ast.CodeBlock {
        return this.generateForExamples(endpoint, [example]);
    }

    public generateForExamples(
        endpoint: HttpEndpoint,
        examples: ExampleEndpointCall[],
        options?: { skipBodyMatch?: boolean }
    ): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            examples.forEach((example, index) => {
                const suffix = examples.length === 1 ? "" : `_${index}`;
                let responseSupported = false;
                let jsonExampleResponse: unknown | undefined = undefined;
                if (example.response != null) {
                    if (example.response.type !== "ok" || example.response.value.type !== "body") {
                        throw GeneratorError.internalError("Unexpected error response type");
                    }
                    const responseValue = example.response.value.value;
                    jsonExampleResponse =
                        responseValue != null
                            ? this.filterExampleTypeReference(responseValue, { filterWriteOnly: true })
                            : undefined;
                }
                const responseBodyType = endpoint.response?.body?.type;
                // whether or not we support this response type in this generator; the example json may
                // have a response that we can return, but our generated method actually returns void
                responseSupported =
                    jsonExampleResponse != null && (responseBodyType === "json" || responseBodyType === "text");

                const requestContentType = getContentTypeFromRequestBody(endpoint);
                // For form-urlencoded requests, we don't need the requestJson variable
                // since we use FormUrlEncodedMatcher directly with key=value pairs
                if (example.request != null && requestContentType !== "application/x-www-form-urlencoded") {
                    // Filter out read-only properties from the request JSON and add defaults when enabled
                    // Read-only properties are not serialized by the SDK, so they should not be
                    // included in the mock server's expected request body
                    const filteredRequestJson = this.filterReadOnlyPropertiesFromExample(example.request, endpoint);

                    writer.writeLine(`const string requestJson${suffix} = """`);
                    writer.writeLine(
                        JSON.stringify(filteredRequestJson, null, 2).replace(/"\\{1,2}\$ref"/g, '"$ref\"')
                    );
                    writer.writeTextStatement('"""');
                }
                writer.newLine();

                if (jsonExampleResponse != null) {
                    if (responseBodyType === "json") {
                        writer.writeLine(`const string mockResponse${suffix} = """`);
                        writer.writeLine(
                            JSON.stringify(jsonExampleResponse, null, 2).replace(/"\\{1,2}\$ref"/g, '"$ref\"')
                        );
                        writer.writeTextStatement('"""');
                    } else if (responseBodyType === "text") {
                        writer.writeTextStatement(
                            `const string mockResponse${suffix} = "${jsonExampleResponse as string}"`
                        );
                    }
                }

                writer.newLine();

                writer.write("Server.Given(WireMock.RequestBuilders.Request.Create()");
                writer.write(`.WithPath("${this.toWireMockPath(example.url)}")`);

                for (const parameter of example.queryParameters) {
                    const maybeParameterValue = this.exampleToQueryOrHeaderValue(parameter);
                    if (maybeParameterValue != null) {
                        const encodedKey = percentEncodeQueryKey(getWireValue(parameter.name));
                        // WireMock.Net splits comma-delimited query values into separate array
                        // entries, so pass all values in a single WithParam call.
                        const paramValues = maybeParameterValue.split(",").map((v) => `"${escapeForCSharpString(v)}"`);
                        writer.write(`.WithParam("${encodedKey}", ${paramValues.join(", ")})`);
                    }
                }
                for (const header of [...example.serviceHeaders, ...example.endpointHeaders]) {
                    const maybeHeaderValue = this.exampleToQueryOrHeaderValue(header);
                    if (maybeHeaderValue != null) {
                        writer.write(
                            `.WithHeader("${getWireValue(header.name)}", "${escapeForCSharpString(maybeHeaderValue)}")`
                        );
                    }
                }
                // Add auth header matching for endpoints that require authentication.
                if (endpoint.auth) {
                    if (isEndpointSecurity(this.context)) {
                        // Per-endpoint security: the SDK routes only the auth scheme(s) this endpoint
                        // declares, so assert the routed scheme's header(s) are present (and the other
                        // schemes' headers are absent) rather than every scheme's header.
                        for (const matcher of this.getEndpointSecurityAuthHeaderMatchers(endpoint)) {
                            switch (matcher.kind) {
                                case "exact":
                                    writer.write(
                                        `.WithHeader("${matcher.headerName}", "${escapeForCSharpString(matcher.value)}")`
                                    );
                                    break;
                                case "present":
                                    // Match on presence only (any value); the value is resolved at runtime.
                                    writer.write(`.WithHeader("${matcher.headerName}", "*")`);
                                    break;
                                case "absent":
                                    // Reject the request if this auth header is present, proving the SDK
                                    // did not send a scheme this endpoint does not declare.
                                    writer.write(
                                        `.WithHeader("${matcher.headerName}", "*", WireMock.Matchers.MatchBehaviour.RejectOnMatch)`
                                    );
                                    break;
                                default:
                                    assertNever(matcher);
                            }
                        }
                    } else if (!this.hasEndpointSecurity(endpoint)) {
                        // Non-endpoint-security API: preserve existing behavior. Skip when the
                        // endpoint carries a per-endpoint security list (header overwriting across
                        // schemes makes the exact value unpredictable in that case).
                        for (const scheme of this.context.ir.auth.schemes) {
                            switch (scheme.type) {
                                case "basic": {
                                    // Compute exact expected header value from the known test credentials
                                    const username = this.case.screamingSnakeSafe(scheme.username);
                                    const password = this.case.screamingSnakeSafe(scheme.password);
                                    const encoded = Buffer.from(`${username}:${password}`).toString("base64");
                                    writer.write(
                                        `.WithHeader("Authorization", "Basic ${escapeForCSharpString(encoded)}")`
                                    );
                                    break;
                                }
                                case "bearer": {
                                    const tokenValue = this.case.screamingSnakeSafe(scheme.token);
                                    writer.write(
                                        `.WithHeader("Authorization", "Bearer ${escapeForCSharpString(tokenValue)}")`
                                    );
                                    break;
                                }
                                case "header": {
                                    const headerName = scheme.name != null ? getWireValue(scheme.name) : undefined;
                                    const headerValue =
                                        scheme.name != null ? this.case.screamingSnakeSafe(scheme.name) : undefined;
                                    if (headerName && headerValue) {
                                        const prefix = scheme.prefix;
                                        const fullValue = prefix != null ? `${prefix} ${headerValue}` : headerValue;
                                        writer.write(
                                            `.WithHeader("${headerName}", "${escapeForCSharpString(fullValue)}")`
                                        );
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
                // an example that omits an optional request body sends no content, so the stub
                // must not match on a content type the request will not carry
                if (requestContentType && example.request != null) {
                    writer.write(`.WithHeader("Content-Type", "${escapeForCSharpString(requestContentType)}")`);
                }

                writer.write(
                    `.Using${endpoint.method.charAt(0).toUpperCase()}${endpoint.method.slice(1).toLowerCase()}()`
                );
                // Skip body matching for OAuth endpoints where the actual request may not include all optional fields
                if (example.request != null && !options?.skipBodyMatch) {
                    if (requestContentType === "application/x-www-form-urlencoded") {
                        // For form-urlencoded requests, use FormUrlEncodedMatcher
                        const filteredRequestJson = this.filterReadOnlyPropertiesFromExample(example.request, endpoint);
                        const formPairs = this.convertToFormUrlEncodedPairs(filteredRequestJson);
                        writer.write(`.WithBody(new WireMock.Matchers.FormUrlEncodedMatcher([${formPairs}]))`);
                    } else if (typeof example.request.jsonExample !== "object") {
                        // Not entirely sure why we can't use BodyAsJson here, but it causes test failure
                        writer.write(`.WithBody(requestJson${suffix})`);
                    } else {
                        writer.write(`.WithBodyAsJson(requestJson${suffix})`);
                    }
                }
                writer.writeLine(")");
                writer.newLine();
                writer.writeLine(".RespondWith(WireMock.ResponseBuilders.Response.Create()");
                writer.writeLine(".WithStatusCode(200)");
                if (responseSupported) {
                    writer.writeTextStatement(`.WithBody(mockResponse${suffix}))`);
                } else {
                    writer.writeTextStatement(")");
                }
            });
        });
    }

    /**
     * Returns the request path to match against in a WireMock stub.
     *
     * WireMock.Net matches `WithPath` against the percent-decoded request path, so the
     * stub must use the decoded form. The IR's `example.url` percent-encodes path parameter
     * values (e.g. an enum wire value of `>` becomes `%3E`), which would never match.
     *
     * The decoded value is escaped for embedding in a C# string literal (decoding can
     * reintroduce `"`/`\`), matching the escaping applied to query parameter values above.
     *
     * Duplicate slashes (from base-paths that join into an empty segment) are collapsed so
     * the stub matches the collapsed path the generated client requests.
     */
    private toWireMockPath(url: string | undefined): string {
        if (!url) {
            return "/";
        }
        try {
            return this.escapeForCSharpStringLiteral(normalizePathSlashes(decodeURIComponent(url)));
        } catch {
            return this.escapeForCSharpStringLiteral(normalizePathSlashes(url));
        }
    }

    private escapeForCSharpStringLiteral(value: string): string {
        return escapeForCSharpString(value);
    }

    /*
     If the example not a string, skip for now. If it's a string, check if it's a datetime
     and normalize the string so that we can match it in wire tests.
     */
    private exampleToQueryOrHeaderValue({ value }: { value: ExampleTypeReference }): string | undefined {
        if (typeof value.jsonExample === "string") {
            const maybeDatetime = this.getDateTime(value);
            return maybeDatetime != null ? maybeDatetime.toISOString() : value.jsonExample;
        }
        if (typeof value.jsonExample === "number") {
            return value.jsonExample.toString();
        }
        return undefined;
    }

    private getDateTime(exampleTypeReference: ExampleTypeReference): Date | undefined {
        switch (exampleTypeReference.shape.type) {
            case "container": {
                const container = exampleTypeReference.shape.container;
                if (container.type === "optional") {
                    return container.optional == null ? undefined : this.getDateTime(container.optional);
                }
                if (container.type === "nullable") {
                    return container.nullable == null ? undefined : this.getDateTime(container.nullable);
                }
                return undefined;
            }
            case "named":
                if (exampleTypeReference.shape.shape.type !== "alias") {
                    return undefined;
                }
                return this.getDateTime(exampleTypeReference.shape.shape.value);
            case "primitive":
                return exampleTypeReference.shape.primitive.type === "datetime"
                    ? exampleTypeReference.shape.primitive.datetime
                    : undefined;
            case "unknown":
                return undefined;
        }
    }

    /**
     * Returns true if the endpoint has per-endpoint security defined.
     */
    private hasEndpointSecurity(endpoint: HttpEndpoint): boolean {
        return endpoint.security != null && endpoint.security.length > 0;
    }

    /**
     * Computes the auth-header matchers to assert on the mock server request for an endpoint in
     * endpoint-security mode.
     *
     * The base mock-server test constructs the client with credentials for every auth scheme, so
     * every scheme is "available". `ClientOptions.GetAuthHeadersForEndpoint` then routes headers by
     * selecting the FIRST of the endpoint's security requirements whose schemes are all available
     * (OR across requirements, AND within one) and combining that requirement's schemes' headers
     * (last write wins per header name). This mirrors that routing to determine exactly which auth
     * headers the SDK will send, then asserts:
     * - the routed header(s) are present (exact value for static schemes; presence-only for schemes
     *   whose value is resolved at runtime, i.e. OAuth/inferred),
     * - every other auth header the API could emit is absent.
     */
    private getEndpointSecurityAuthHeaderMatchers(endpoint: HttpEndpoint): AuthHeaderMatcher[] {
        // Map each scheme (by its IR key) to the header(s) it contributes when its credentials are present.
        const schemeHeadersByKey = new Map<
            string,
            Array<{ headerName: string; kind: "present" | "exact"; value?: string }>
        >();
        for (const scheme of this.context.ir.auth.schemes) {
            schemeHeadersByKey.set(scheme.key, this.getSchemeAuthHeaders(scheme));
        }

        // The universe of auth header names the API could emit; anything not routed to this endpoint
        // must be asserted absent. Preserves scheme order for deterministic output.
        const universe: string[] = [];
        for (const headers of schemeHeadersByKey.values()) {
            for (const header of headers) {
                if (!universe.includes(header.headerName)) {
                    universe.push(header.headerName);
                }
            }
        }

        // The mock client supplies every scheme's credentials, so treat all schemes as available.
        const availableKeys = new Set(schemeHeadersByKey.keys());
        const requirements = endpoint.security ?? [];
        const winningRequirement = requirements.find((requirement) =>
            Object.keys(requirement).every((schemeKey) => availableKeys.has(schemeKey))
        );

        // Build the effective header map for the winning requirement (last write wins per header name).
        const effective = new Map<string, { kind: "present" | "exact"; value?: string }>();
        if (winningRequirement != null) {
            for (const schemeKey of Object.keys(winningRequirement)) {
                for (const header of schemeHeadersByKey.get(schemeKey) ?? []) {
                    effective.set(header.headerName, { kind: header.kind, value: header.value });
                }
            }
        }

        const matchers: AuthHeaderMatcher[] = [];
        for (const [headerName, matcher] of effective) {
            if (matcher.kind === "exact" && matcher.value != null) {
                matchers.push({ headerName, kind: "exact", value: matcher.value });
            } else {
                matchers.push({ headerName, kind: "present" });
            }
        }
        for (const headerName of universe) {
            if (!effective.has(headerName)) {
                matchers.push({ headerName, kind: "absent" });
            }
        }
        return matchers;
    }

    /**
     * Returns the auth header(s) a scheme contributes when its credentials are present, using the
     * same placeholder credential values the base mock-server test constructs the client with
     * (see RootClientGenerator.generateExampleClientInstantiationSnippet). Static schemes
     * (bearer/header/basic) yield an exact expected value; OAuth/inferred yield presence-only
     * because their header values are resolved from a live token endpoint at runtime.
     */
    private getSchemeAuthHeaders(
        scheme: AuthScheme
    ): Array<{ headerName: string; kind: "present" | "exact"; value?: string }> {
        switch (scheme.type) {
            case "bearer": {
                const tokenValue = this.case.screamingSnakeSafe(scheme.token);
                return [{ headerName: "Authorization", kind: "exact", value: `Bearer ${tokenValue}` }];
            }
            case "header": {
                if (scheme.name == null) {
                    return [];
                }
                const headerName = getWireValue(scheme.name);
                const headerValue = this.case.screamingSnakeSafe(scheme.name);
                const value = scheme.prefix != null ? `${scheme.prefix} ${headerValue}` : headerValue;
                return [{ headerName, kind: "exact", value }];
            }
            case "basic": {
                const usernameOmitted = !!scheme.usernameOmit;
                const passwordOmitted = !!scheme.passwordOmit;
                if (usernameOmitted && passwordOmitted) {
                    return [];
                }
                const username = usernameOmitted ? "" : this.case.screamingSnakeSafe(scheme.username);
                const password = passwordOmitted ? "" : this.case.screamingSnakeSafe(scheme.password);
                const encoded = Buffer.from(`${username}:${password}`).toString("base64");
                return [{ headerName: "Authorization", kind: "exact", value: `Basic ${encoded}` }];
            }
            case "oauth":
                // OAuth writes Authorization with a token fetched from the token endpoint at runtime.
                return [{ headerName: "Authorization", kind: "present" }];
            case "inferred": {
                // Inferred auth writes its authenticated request header(s) with a runtime-resolved value.
                const inferred = this.context.getInferredAuth();
                const authenticatedHeaders = inferred?.tokenEndpoint.authenticatedRequestHeaders ?? [];
                if (authenticatedHeaders.length === 0) {
                    return [{ headerName: "Authorization", kind: "present" }];
                }
                return authenticatedHeaders.map((header) => ({
                    headerName: header.headerName,
                    kind: "present" as const
                }));
            }
            default:
                assertNever(scheme);
        }
    }

    /**
     * Filters out read-only properties from an example request body and adds default values when enabled.
     * Uses the jsonExample directly to preserve any modifications made by other code
     * (e.g., OAuth credential placeholders set by deepSetProperty).
     * Only filters out read-only properties when necessary.
     */
    private filterReadOnlyPropertiesFromExample(exampleRequest: ExampleRequestBody, endpoint: HttpEndpoint): unknown {
        if (exampleRequest.type === "inlinedRequestBody") {
            return this.filterInlinedRequestBody(exampleRequest, endpoint);
        } else {
            // exampleRequest.type === "reference"
            // For reference request bodies, use the jsonExample directly to preserve
            // any modifications made by other code (e.g., deepSetProperty for OAuth credentials).
            // We still need to filter out read-only properties if the referenced type has any.
            return this.filterReferenceRequestBody(exampleRequest);
        }
    }

    /**
     * Filters read-only properties from a reference request body and normalizes datetime values.
     * Always uses recursive filtering to ensure datetime values are normalized to ISO 8601 format.
     */
    private filterReferenceRequestBody(exampleRequest: FernIr.ExampleRequestBody.Reference): unknown {
        // Always use recursive filtering to:
        // 1. Remove read-only properties if any exist
        // 2. Normalize datetime values to ISO 8601 format for wire test matching
        return this.filterExampleTypeReference(exampleRequest);
    }

    /**
     * Checks if a type or any of its nested types have read-only properties.
     */
    private typeHasReadOnlyProperties(shape: ExampleTypeReference["shape"]): boolean {
        switch (shape.type) {
            case "primitive":
            case "unknown":
                return false;

            case "container":
                return this.containerHasReadOnlyProperties(shape.container);

            case "named":
                return this.namedTypeHasReadOnlyProperties(shape);
        }
    }

    /**
     * Checks if a container type has read-only properties in its nested types.
     */
    private containerHasReadOnlyProperties(
        container:
            | { type: "list"; list: ExampleTypeReference[] }
            | { type: "set"; set: ExampleTypeReference[] }
            | { type: "optional"; optional: ExampleTypeReference | undefined }
            | { type: "nullable"; nullable: ExampleTypeReference | undefined }
            | { type: "map"; map: Array<{ key: ExampleTypeReference; value: ExampleTypeReference }> }
            | { type: "literal"; literal: unknown }
    ): boolean {
        switch (container.type) {
            case "list":
                return container.list.some((item) => this.typeHasReadOnlyProperties(item.shape));

            case "set":
                return container.set.some((item) => this.typeHasReadOnlyProperties(item.shape));

            case "optional":
                return container.optional != null && this.typeHasReadOnlyProperties(container.optional.shape);

            case "nullable":
                return container.nullable != null && this.typeHasReadOnlyProperties(container.nullable.shape);

            case "map":
                return container.map.some((entry) => this.typeHasReadOnlyProperties(entry.value.shape));

            case "literal":
                return false;
        }
    }

    /**
     * Checks if a named type has read-only properties.
     */
    private namedTypeHasReadOnlyProperties(namedShape: {
        type: "named";
        typeName: { typeId: TypeId };
        shape:
            | {
                  type: "object";
                  properties: Array<{ name: FernIr.NameAndWireValue | string; value: ExampleTypeReference }>;
              }
            | { type: "union"; discriminant: FernIr.NameAndWireValue | string; singleUnionType: unknown }
            | { type: "enum"; value: FernIr.NameAndWireValue | string }
            | { type: "alias"; value: ExampleTypeReference }
            | { type: "undiscriminatedUnion"; index: number; singleUnionType: ExampleTypeReference };
    }): boolean {
        const typeId = namedShape.typeName.typeId;
        const typeDeclaration = this.context.model.dereferenceType(typeId).typeDeclaration;
        const readOnlyNames = this.getReadOnlyPropertyNamesForType(typeDeclaration);

        // If this type has read-only properties, return true
        if (readOnlyNames.size > 0) {
            return true;
        }

        // Check nested types
        const innerShape = namedShape.shape;
        switch (innerShape.type) {
            case "object":
                return innerShape.properties.some((prop) => this.typeHasReadOnlyProperties(prop.value.shape));

            case "alias":
                return this.typeHasReadOnlyProperties(innerShape.value.shape);

            case "enum":
                return false;

            case "union":
            case "undiscriminatedUnion":
                // For unions, we'd need to check all variants, but for simplicity, assume no read-only properties
                return false;
        }
    }

    /**
     * Filters read-only properties from an inlined request body, normalizes datetime values,
     * and adds default values when enabled.
     * Always uses recursive filtering to ensure datetime values are normalized to ISO 8601 format.
     */
    private filterInlinedRequestBody(
        exampleRequest: FernIr.ExampleRequestBody.InlinedRequestBody,
        endpoint: HttpEndpoint
    ): Record<string, unknown> {
        // Build the set of nullable property wire names so we can distinguish
        // optional-but-not-nullable (null is omitted by WhenWritingNull) from
        // nullable (null is explicitly serialized via [Nullable] attribute).
        const nullableNames = this.getNullablePropertyNamesFromEndpoint(endpoint);

        // Build the result with filtering and datetime normalization
        const result: Record<string, unknown> = {};

        for (const prop of exampleRequest.properties) {
            // Check if this property is read-only by looking up the original type declaration
            if (this.isPropertyReadOnly(getWireValue(prop.name), prop.originalTypeDeclaration)) {
                continue;
            }
            // Recursively filter the property value (also normalizes datetime values)
            const filteredValue = this.filterExampleTypeReference(prop.value);

            // Omit null values for properties that are optional-but-not-nullable
            // since the SDK won't serialize those nulls (JsonIgnoreCondition.WhenWritingNull)
            if (filteredValue === null && !nullableNames.has(getWireValue(prop.name))) {
                continue;
            }
            result[getWireValue(prop.name)] = filteredValue;
        }

        // Also include extra properties if present
        if (exampleRequest.extraProperties) {
            for (const extraProp of exampleRequest.extraProperties) {
                result[getWireValue(extraProp.name)] = this.filterExampleTypeReference(extraProp.value);
            }
        }

        // Literal-typed properties are implicit constants that never appear in examples, yet
        // the SDK always serializes them with their constant value. Include them in the expected
        // request JSON so the mock server matches the SDK's serialized output.
        if (endpoint.requestBody?.type === "inlinedRequestBody") {
            const allProps = [...endpoint.requestBody.properties, ...(endpoint.requestBody.extendedProperties ?? [])];
            for (const prop of allProps) {
                const wireValue = getWireValue(prop.name);
                if (wireValue in result) {
                    continue;
                }
                if (prop.propertyAccess === FernIr.ObjectPropertyAccess.ReadOnly) {
                    continue;
                }
                const literalValue = this.getLiteralWireValue(prop.valueType);
                if (literalValue !== undefined) {
                    result[wireValue] = literalValue;
                }
            }
        }

        return result;
    }

    /**
     * Checks if a property is read-only by looking up its type declaration.
     */
    private isPropertyReadOnly(wireValue: string, typeDeclarationName: { typeId: TypeId } | undefined): boolean {
        if (typeDeclarationName == null) {
            return false;
        }

        const typeDeclaration = this.context.model.dereferenceType(typeDeclarationName.typeId).typeDeclaration;
        if (typeDeclaration.shape.type !== "object") {
            return false;
        }

        // Check properties
        for (const prop of typeDeclaration.shape.properties) {
            if (getWireValue(prop.name) === wireValue && prop.propertyAccess === FernIr.ObjectPropertyAccess.ReadOnly) {
                return true;
            }
        }

        // Check extended properties
        if (typeDeclaration.shape.extendedProperties) {
            for (const prop of typeDeclaration.shape.extendedProperties) {
                if (
                    getWireValue(prop.name) === wireValue &&
                    prop.propertyAccess === FernIr.ObjectPropertyAccess.ReadOnly
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Filters properties from an example type reference.
     * Recursively handles containers (optional, list, map, etc.) and named types.
     * Also normalizes datetime/date values to ISO 8601 format for wire test matching.
     * @param filterWriteOnly - If true, filters write-only properties (for responses). If false, filters read-only (for requests).
     */
    private filterExampleTypeReference(
        exampleTypeRef: ExampleTypeReference,
        options: { filterWriteOnly?: boolean } = {}
    ): unknown {
        const shape = exampleTypeRef.shape;

        switch (shape.type) {
            case "primitive":
                // Normalize datetime/date values to ISO 8601 format for wire test matching
                // Only normalize actual datetime/date types, NOT string fields that happen to contain datetime-like values
                if (shape.primitive.type === "datetime" && typeof exampleTypeRef.jsonExample === "string") {
                    return new Date(exampleTypeRef.jsonExample).toISOString();
                }
                if (shape.primitive.type === "date" && typeof exampleTypeRef.jsonExample === "string") {
                    return new Date(exampleTypeRef.jsonExample).toISOString().slice(0, 10);
                }
                return exampleTypeRef.jsonExample;

            case "unknown":
                return exampleTypeRef.jsonExample;

            case "container":
                // For literal containers, just return the jsonExample value directly
                // since the literal value is already the correct wire value
                if (shape.container.type === "literal") {
                    return exampleTypeRef.jsonExample;
                }
                return this.filterContainerExample(shape.container, options);

            case "named":
                return this.filterNamedExample(shape, options);
        }
    }

    /**
     * Filters properties from a container example (optional, list, map, etc.).
     */
    private filterContainerExample(
        container:
            | { type: "list"; list: ExampleTypeReference[] }
            | { type: "set"; set: ExampleTypeReference[] }
            | { type: "optional"; optional: ExampleTypeReference | undefined }
            | { type: "nullable"; nullable: ExampleTypeReference | undefined }
            | { type: "map"; map: Array<{ key: ExampleTypeReference; value: ExampleTypeReference }> }
            | { type: "literal"; literal: unknown },
        options: { filterWriteOnly?: boolean } = {}
    ): unknown {
        switch (container.type) {
            case "list":
                return container.list.map((item) => this.filterExampleTypeReference(item, options));

            case "set":
                return container.set.map((item) => this.filterExampleTypeReference(item, options));

            case "optional":
                if (container.optional == null) {
                    return null;
                }
                return this.filterExampleTypeReference(container.optional, options);

            case "nullable":
                if (container.nullable == null) {
                    return null;
                }
                return this.filterExampleTypeReference(container.nullable, options);

            case "map": {
                const mapResult: Record<string, unknown> = {};
                for (const entry of container.map) {
                    const key = entry.key.jsonExample;
                    // JSON object keys are always strings, but the example might have numeric keys
                    if (typeof key === "string" || typeof key === "number") {
                        mapResult[String(key)] = this.filterExampleTypeReference(entry.value, options);
                    }
                }
                return mapResult;
            }

            case "literal":
                return this.extractLiteralValue(container.literal);
        }
    }

    /**
     * Extracts the actual value from an ExamplePrimitive literal.
     * Literals in the IR are represented as discriminated unions like { type: "boolean", boolean: false }.
     */
    private extractLiteralValue(literal: unknown): unknown {
        const lit = literal as { type: string; [key: string]: unknown };
        switch (lit.type) {
            case "boolean":
                return lit.boolean;
            case "string":
                return (lit.string as { original: string })?.original ?? lit.string;
            default:
                // For other types, try to extract the value by type name
                return lit[lit.type] ?? literal;
        }
    }

    /**
     * Filters properties from a named type example.
     */
    private filterNamedExample(
        namedShape: {
            type: "named";
            typeName: { typeId: TypeId };
            shape:
                | {
                      type: "object";
                      properties: Array<{ name: FernIr.NameAndWireValue | string; value: ExampleTypeReference }>;
                      extraProperties?: Array<{ name: FernIr.NameAndWireValue | string; value: ExampleTypeReference }>;
                  }
                | { type: "union"; discriminant: FernIr.NameAndWireValue | string; singleUnionType: unknown }
                | { type: "enum"; value: FernIr.NameAndWireValue | string }
                | { type: "alias"; value: ExampleTypeReference }
                | { type: "undiscriminatedUnion"; index: number; singleUnionType: ExampleTypeReference };
        },
        options: { filterWriteOnly?: boolean } = {}
    ): unknown {
        const typeId = namedShape.typeName.typeId;
        const innerShape = namedShape.shape;

        switch (innerShape.type) {
            case "object":
                return this.filterObjectExample(typeId, innerShape.properties, options, innerShape.extraProperties);

            case "alias":
                return this.filterExampleTypeReference(innerShape.value, options);

            case "enum":
                return getWireValue(innerShape.value);

            case "union":
                // For unions, we need to handle the discriminant and the union value
                return this.filterUnionExample(typeId, innerShape, options);

            case "undiscriminatedUnion":
                return this.filterExampleTypeReference(innerShape.singleUnionType, options);
        }
    }

    /**
     * Filters properties from an object example.
     * Also omits null values for properties that are optional-but-not-nullable,
     * since the SDK won't serialize those nulls.
     * @param filterWriteOnly - If true, filters both write-only and read-only properties (for responses).
     *                          Write-only are not deserialized, read-only are not serialized when comparing.
     *                          If false, filters only read-only (for requests).
     */
    private filterObjectExample(
        typeId: TypeId,
        properties: Array<{ name: FernIr.NameAndWireValue | string; value: ExampleTypeReference }>,
        options: { filterWriteOnly?: boolean } = {},
        extraProperties?: Array<{ name: FernIr.NameAndWireValue | string; value: ExampleTypeReference }>
    ): Record<string, unknown> {
        const typeDeclaration = this.context.model.dereferenceType(typeId).typeDeclaration;
        const readOnlyNames = this.getReadOnlyPropertyNamesForType(typeDeclaration);
        const writeOnlyNames = options.filterWriteOnly
            ? this.getWriteOnlyPropertyNamesForType(typeDeclaration)
            : new Set<string>();
        const propertiesToFilter = new Set([...readOnlyNames, ...writeOnlyNames]);
        const nullableNames = this.getNullablePropertyNamesForType(typeDeclaration);

        const result: Record<string, unknown> = {};
        for (const prop of properties) {
            if (propertiesToFilter.has(getWireValue(prop.name))) {
                continue;
            }
            const filteredValue = this.filterExampleTypeReference(prop.value, options);

            // Omit null values for properties that are optional-but-not-nullable
            // since the SDK won't serialize those nulls (JsonIgnoreCondition.WhenWritingNull)
            if (filteredValue === null && !nullableNames.has(getWireValue(prop.name))) {
                continue;
            }
            result[getWireValue(prop.name)] = filteredValue;
        }

        // Include extra properties (AdditionalProperties) inline — they serialize via [JsonExtensionData]
        if (extraProperties != null) {
            for (const extraProp of extraProperties) {
                result[getWireValue(extraProp.name)] = this.filterExampleTypeReference(extraProp.value, options);
            }
        }

        // Include default JSON values for required properties missing from the example
        // so mock server request JSON matches the SDK's serialized output.
        if (typeDeclaration.shape.type === "object") {
            const allProps: ObjectProperty[] = [
                ...typeDeclaration.shape.properties,
                ...(typeDeclaration.shape.extendedProperties ?? [])
            ];
            for (const prop of allProps) {
                const wireValue = getWireValue(prop.name);
                if (wireValue in result) {
                    continue;
                }
                if (propertiesToFilter.has(wireValue)) {
                    continue;
                }
                if (this.isRequiredProperty(prop.valueType)) {
                    const defaultValue = this.getDefaultJsonValueForType(prop.valueType);
                    if (defaultValue !== undefined) {
                        result[wireValue] = defaultValue;
                    }
                }
            }
        }

        return result;
    }

    /**
     * Returns the constant wire value for a (non-optional) literal-typed property, or undefined
     * if the type is not a literal. Literal properties are implicit constants that the SDK always
     * serializes even when they are absent from the example.
     */
    private getLiteralWireValue(typeReference: TypeReference): unknown {
        if (typeReference.type !== "container" || typeReference.container.type !== "literal") {
            return undefined;
        }
        return typeReference.container.literal._visit<unknown>({
            string: (value) => value,
            boolean: (value) => value,
            _other: () => undefined
        });
    }

    /**
     * Returns true if a property's type will be marked as `required` in C#.
     */
    private isRequiredProperty(typeReference: TypeReference): boolean {
        if (this.context.isOptional(typeReference) || this.context.isNullable(typeReference)) {
            return false;
        }
        if (typeReference.type === "container") {
            const ct = typeReference.container.type;
            if (ct === "list" || ct === "set" || ct === "map") {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns the JSON default value for a type reference.
     * Used when a required property is missing from an example.
     */
    private getDefaultJsonValueForType(typeReference: TypeReference, visitedTypeIds?: Set<string>): unknown {
        switch (typeReference.type) {
            case "primitive":
                return FernIr.PrimitiveTypeV1._visit<unknown>(typeReference.primitive.v1, {
                    integer: () => 0,
                    long: () => 0,
                    uint: () => 0,
                    uint64: () => 0,
                    float: () => 0.0,
                    double: () => 0.0,
                    boolean: () => false,
                    string: () => "",
                    date: () => "0001-01-01",
                    dateTime: () => "0001-01-01T00:00:00.000Z",
                    uuid: () => "",
                    base64: () => "",
                    bigInteger: () => "",
                    dateTimeRfc2822: () => "0001-01-01T00:00:00.000Z",
                    _other: () => undefined
                });
            case "named": {
                const typeDeclaration = this.context.model.dereferenceType(typeReference.typeId).typeDeclaration;
                if (typeDeclaration.shape.type === "alias") {
                    return this.getDefaultJsonValueForType(typeDeclaration.shape.aliasOf, visitedTypeIds);
                }
                if (typeDeclaration.shape.type === "enum" && typeDeclaration.shape.values.length > 0) {
                    const firstEnumValue = typeDeclaration.shape.values[0];
                    if (firstEnumValue != null) {
                        return getWireValue(firstEnumValue.name);
                    }
                }
                if (typeDeclaration.shape.type === "object") {
                    return this.getDefaultJsonValueForObject(
                        typeReference.typeId,
                        typeDeclaration.shape,
                        visitedTypeIds
                    );
                }
                return undefined;
            }
            case "container":
                // Literal-typed properties are always serialized by the SDK with their
                // constant value, so use that value as the default for wire test matching.
                if (typeReference.container.type === "literal") {
                    return typeReference.container.literal._visit<unknown>({
                        string: (value) => value,
                        boolean: (value) => value,
                        _other: () => undefined
                    });
                }
                return undefined;
            default:
                return undefined;
        }
    }

    /**
     * Returns a default JSON object for a required nested object type.
     * Recursively fills in required properties with defaults.
     */
    private getDefaultJsonValueForObject(
        typeId: TypeId,
        objectShape: { properties: ObjectProperty[]; extendedProperties?: ObjectProperty[] },
        visitedTypeIds?: Set<string>
    ): Record<string, unknown> | undefined {
        const visited = visitedTypeIds ?? new Set<string>();
        if (visited.has(typeId)) {
            return undefined;
        }
        visited.add(typeId);

        const result: Record<string, unknown> = {};
        const allProps = [...objectShape.properties, ...(objectShape.extendedProperties ?? [])];
        for (const prop of allProps) {
            if (this.isRequiredProperty(prop.valueType)) {
                const defaultValue = this.getDefaultJsonValueForType(prop.valueType, visited);
                if (defaultValue !== undefined) {
                    result[getWireValue(prop.name)] = defaultValue;
                }
            }
        }

        visited.delete(typeId);

        return result;
    }

    /**
     * Filters properties from a union example.
     */
    private filterUnionExample(
        typeId: TypeId,
        unionShape: { discriminant: FernIr.NameAndWireValue | string; singleUnionType: unknown },
        options: { filterWriteOnly?: boolean } = {}
    ): unknown {
        // Union examples have a complex structure
        // The singleUnionType has a wireDiscriminantValue and a shape that describes the variant
        const singleUnionType = unionShape.singleUnionType as {
            wireDiscriminantValue: FernIr.NameAndWireValue | string;
            shape:
                | {
                      type: "samePropertiesAsObject";
                      typeId: TypeId;
                      object: {
                          properties: Array<{ name: FernIr.NameAndWireValue | string; value: ExampleTypeReference }>;
                      };
                  }
                | ({ type: "singleProperty" } & ExampleTypeReference)
                | { type: "noProperties" };
        };

        const result: Record<string, unknown> = {
            [getWireValue(unionShape.discriminant)]: getWireValue(singleUnionType.wireDiscriminantValue)
        };

        if (singleUnionType.shape.type === "samePropertiesAsObject") {
            const filteredProps = this.filterObjectExample(
                singleUnionType.shape.typeId,
                singleUnionType.shape.object.properties,
                options
            );
            Object.assign(result, filteredProps);
        } else if (singleUnionType.shape.type === "singleProperty") {
            // For singleProperty, the shape itself extends ExampleTypeReference
            // so it has shape and jsonExample fields directly on it
            const filteredValue = this.filterExampleTypeReference(singleUnionType.shape, options);
            // Look up the union type definition to get the correct property wire name
            // for singleProperty variants (e.g., "value")
            const propertyWireName = this.getSinglePropertyWireName(
                typeId,
                getWireValue(singleUnionType.wireDiscriminantValue)
            );
            result[propertyWireName] = filteredValue;
        }

        return result;
    }

    /**
     * Looks up the union type definition to find the wire name for a singleProperty variant.
     * Falls back to the discriminant wire value if the type definition can't be found.
     */
    private getSinglePropertyWireName(typeId: TypeId, discriminantWireValue: string): string {
        try {
            const typeDeclaration = this.context.model.dereferenceType(typeId).typeDeclaration;
            if (typeDeclaration.shape.type === "union") {
                const matchingType = typeDeclaration.shape.types.find(
                    (t) => getWireValue(t.discriminantValue) === discriminantWireValue
                );
                if (matchingType?.shape.propertiesType === "singleProperty") {
                    return getWireValue(matchingType.shape.name);
                }
            }
        } catch {
            // Fall through to default
        }
        return discriminantWireValue;
    }

    /**
     * Gets the set of read-only property wire names for a type declaration.
     */
    private getReadOnlyPropertyNamesForType(typeDeclaration: {
        shape: {
            type: string;
            properties?: Array<{ name: FernIr.NameAndWireValue | string; propertyAccess?: string }>;
            extendedProperties?: Array<{ name: FernIr.NameAndWireValue | string; propertyAccess?: string }>;
        };
    }): Set<string> {
        const readOnlyNames = new Set<string>();
        const shape = typeDeclaration.shape;

        if (shape.type !== "object" || !shape.properties) {
            return readOnlyNames;
        }

        for (const prop of shape.properties) {
            if (prop.propertyAccess === FernIr.ObjectPropertyAccess.ReadOnly) {
                readOnlyNames.add(getWireValue(prop.name));
            }
        }

        if (shape.extendedProperties) {
            for (const prop of shape.extendedProperties) {
                if (prop.propertyAccess === FernIr.ObjectPropertyAccess.ReadOnly) {
                    readOnlyNames.add(getWireValue(prop.name));
                }
            }
        }

        return readOnlyNames;
    }

    /**
     * Gets the set of write-only property wire names for a type declaration.
     */
    private getWriteOnlyPropertyNamesForType(typeDeclaration: {
        shape: {
            type: string;
            properties?: Array<{ name: FernIr.NameAndWireValue | string; propertyAccess?: string }>;
            extendedProperties?: Array<{ name: FernIr.NameAndWireValue | string; propertyAccess?: string }>;
        };
    }): Set<string> {
        const writeOnlyNames = new Set<string>();
        const shape = typeDeclaration.shape;

        if (shape.type !== "object" || !shape.properties) {
            return writeOnlyNames;
        }

        for (const prop of shape.properties) {
            if (prop.propertyAccess === FernIr.ObjectPropertyAccess.WriteOnly) {
                writeOnlyNames.add(getWireValue(prop.name));
            }
        }

        if (shape.extendedProperties) {
            for (const prop of shape.extendedProperties) {
                if (prop.propertyAccess === FernIr.ObjectPropertyAccess.WriteOnly) {
                    writeOnlyNames.add(getWireValue(prop.name));
                }
            }
        }

        return writeOnlyNames;
    }

    /**
     * Gets the set of nullable property wire names for a type declaration.
     * A property is nullable if its type is a nullable container or optional<nullable<T>>.
     *
     * When enableExplicitNullableOptional is disabled (default), no [Nullable] attributes
     * are generated and WhenWritingNull omits ALL nulls, so this returns an empty set.
     */
    private getNullablePropertyNamesForType(typeDeclaration: {
        shape: {
            type: string;
            properties?: Array<{ name: FernIr.NameAndWireValue | string; valueType: TypeReference }>;
            extendedProperties?: Array<{ name: FernIr.NameAndWireValue | string; valueType: TypeReference }>;
        };
    }): Set<string> {
        const nullableNames = new Set<string>();

        // When the explicit nullable/optional flag is off, the generator does not emit
        // [Nullable] attributes, so WhenWritingNull omits every null value.
        if (!this.context.generation.settings.enableExplicitNullableOptional) {
            return nullableNames;
        }

        const shape = typeDeclaration.shape;

        if (shape.type !== "object" || !shape.properties) {
            return nullableNames;
        }

        for (const prop of shape.properties) {
            if (this.context.isNullable(prop.valueType)) {
                nullableNames.add(getWireValue(prop.name));
            }
        }

        if (shape.extendedProperties) {
            for (const prop of shape.extendedProperties) {
                if (this.context.isNullable(prop.valueType)) {
                    nullableNames.add(getWireValue(prop.name));
                }
            }
        }

        return nullableNames;
    }

    /**
     * Gets the set of nullable property wire names from an endpoint's inlined request body.
     * Used to determine which null properties should be kept in the expected request JSON
     * (nullable properties serialize null explicitly via [Nullable] attribute) vs omitted
     * (optional-but-not-nullable properties are skipped by JsonIgnoreCondition.WhenWritingNull).
     *
     * When enableExplicitNullableOptional is disabled (default), no [Nullable] attributes
     * are generated and WhenWritingNull omits ALL nulls, so this returns an empty set.
     */
    private getNullablePropertyNamesFromEndpoint(endpoint: HttpEndpoint): Set<string> {
        const nullableNames = new Set<string>();

        // When the explicit nullable/optional flag is off, the generator does not emit
        // [Nullable] attributes, so WhenWritingNull omits every null value.
        if (!this.context.generation.settings.enableExplicitNullableOptional) {
            return nullableNames;
        }

        if (endpoint.requestBody?.type !== "inlinedRequestBody") {
            return nullableNames;
        }
        for (const prop of endpoint.requestBody.properties) {
            if (this.context.isNullable(prop.valueType)) {
                nullableNames.add(getWireValue(prop.name));
            }
        }
        if (endpoint.requestBody.extendedProperties) {
            for (const prop of endpoint.requestBody.extendedProperties) {
                if (this.context.isNullable(prop.valueType)) {
                    nullableNames.add(getWireValue(prop.name));
                }
            }
        }
        return nullableNames;
    }

    /**
     * Converts a JSON object to form-urlencoded key=value pairs for use with FormUrlEncodedMatcher.
     * Returns a string like: "key1=value1", "key2=value2"
     */
    private convertToFormUrlEncodedPairs(json: unknown): string {
        if (typeof json !== "object" || json === null) {
            return "";
        }
        const pairs: string[] = [];
        for (const [key, value] of Object.entries(json)) {
            if (value !== undefined && value !== null) {
                pairs.push(`"${key}=${String(value)}"`);
            }
        }
        return pairs.join(", ");
    }
}

// Characters the C# SDK's QueryStringBuilder treats as safe for query keys.
// Mirrors: unreserved + (sub-delims \ {& = + ;}) + : @ / ?
// See QueryStringBuilder.Template.cs SafeQueryKeyChars.
export const SAFE_QUERY_KEY_CHARS = new Set(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~!$'()*,:@/?"
);

/**
 * Percent-encodes a query parameter key to match the C# SDK's QueryStringBuilder.
 * Characters not in SafeQueryKeyChars are percent-encoded with uppercase hex digits.
 */
export function percentEncodeQueryKey(key: string): string {
    const encoder = new TextEncoder();
    let encoded = "";
    for (const char of key) {
        if (SAFE_QUERY_KEY_CHARS.has(char)) {
            encoded += char;
        } else {
            for (const byte of encoder.encode(char)) {
                encoded += `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
            }
        }
    }
    return encoded;
}
