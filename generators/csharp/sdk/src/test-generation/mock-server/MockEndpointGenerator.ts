import { ast, WithGeneration } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

type ExampleEndpointCall = FernIr.ExampleEndpointCall;
type ExampleRequestBody = FernIr.ExampleRequestBody;
type ExampleTypeReference = FernIr.ExampleTypeReference;
type HttpEndpoint = FernIr.HttpEndpoint;
type ObjectPropertyAccess = FernIr.ObjectPropertyAccess;
const ObjectPropertyAccess = FernIr.ObjectPropertyAccess;
type TypeId = FernIr.TypeId;
type TypeReference = FernIr.TypeReference;

import { getContentTypeFromRequestBody } from "../../endpoint/utils/getContentTypeFromRequestBody.js";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

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
                        throw new Error("Unexpected error response type");
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
                writer.write(`.WithPath("${example.url || "/"}")`);

                for (const parameter of example.queryParameters) {
                    const maybeParameterValue = this.exampleToQueryOrHeaderValue(parameter);
                    if (maybeParameterValue != null) {
                        writer.write(`.WithParam("${parameter.name.wireValue}", "${maybeParameterValue}")`);
                    }
                }
                for (const header of [...example.serviceHeaders, ...example.endpointHeaders]) {
                    const maybeHeaderValue = this.exampleToQueryOrHeaderValue(header);
                    if (maybeHeaderValue != null) {
                        writer.write(`.WithHeader("${header.name.wireValue}", "${maybeHeaderValue}")`);
                    }
                }
                // Add auth header matching for endpoints that require authentication.
                // Skip auth header matching when endpoint has per-endpoint security because
                // the C# client configures all auth schemes globally and header overwriting
                // (e.g., multiple schemes writing to "Authorization") makes the exact value unpredictable.
                if (endpoint.auth && !this.hasEndpointSecurity(endpoint)) {
                    for (const scheme of this.context.ir.auth.schemes) {
                        switch (scheme.type) {
                            case "basic": {
                                // Compute exact expected header value from the known test credentials
                                const username = scheme.username.screamingSnakeCase.safeName;
                                const password = scheme.password.screamingSnakeCase.safeName;
                                const encoded = Buffer.from(`${username}:${password}`).toString("base64");
                                writer.write(`.WithHeader("Authorization", "Basic ${encoded}")`);
                                break;
                            }
                            case "bearer": {
                                const tokenValue = scheme.token.screamingSnakeCase.safeName;
                                writer.write(`.WithHeader("Authorization", "Bearer ${tokenValue}")`);
                                break;
                            }
                            case "header": {
                                const headerName = scheme.name?.wireValue;
                                const headerValue = scheme.name?.name?.screamingSnakeCase?.safeName;
                                if (headerName && headerValue) {
                                    const prefix = scheme.prefix;
                                    const fullValue = prefix != null ? `${prefix} ${headerValue}` : headerValue;
                                    writer.write(`.WithHeader("${headerName}", "${fullValue}")`);
                                }
                                break;
                            }
                        }
                    }
                }
                if (requestContentType) {
                    writer.write(`.WithHeader("Content-Type", "${requestContentType}")`);
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
            case "container":
                if (exampleTypeReference.shape.container.type !== "optional") {
                    return undefined;
                }
                if (exampleTypeReference.shape.container.optional == null) {
                    return undefined;
                }
                return this.getDateTime(exampleTypeReference.shape.container.optional);
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
            | { type: "object"; properties: Array<{ name: { wireValue: string }; value: ExampleTypeReference }> }
            | { type: "union"; discriminant: { wireValue: string }; singleUnionType: unknown }
            | { type: "enum"; value: { wireValue: string } }
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
        _endpoint: HttpEndpoint
    ): Record<string, unknown> {
        // Build the result with filtering and datetime normalization
        const result: Record<string, unknown> = {};

        for (const prop of exampleRequest.properties) {
            // Check if this property is read-only by looking up the original type declaration
            if (this.isPropertyReadOnly(prop.name.wireValue, prop.originalTypeDeclaration)) {
                continue;
            }
            // Recursively filter the property value (also normalizes datetime values)
            result[prop.name.wireValue] = this.filterExampleTypeReference(prop.value);
        }

        // Also include extra properties if present
        if (exampleRequest.extraProperties) {
            for (const extraProp of exampleRequest.extraProperties) {
                result[extraProp.name.wireValue] = this.filterExampleTypeReference(extraProp.value);
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
            if (prop.name.wireValue === wireValue && prop.propertyAccess === FernIr.ObjectPropertyAccess.ReadOnly) {
                return true;
            }
        }

        // Check extended properties
        if (typeDeclaration.shape.extendedProperties) {
            for (const prop of typeDeclaration.shape.extendedProperties) {
                if (prop.name.wireValue === wireValue && prop.propertyAccess === FernIr.ObjectPropertyAccess.ReadOnly) {
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
                | { type: "object"; properties: Array<{ name: { wireValue: string }; value: ExampleTypeReference }> }
                | { type: "union"; discriminant: { wireValue: string }; singleUnionType: unknown }
                | { type: "enum"; value: { wireValue: string } }
                | { type: "alias"; value: ExampleTypeReference }
                | { type: "undiscriminatedUnion"; index: number; singleUnionType: ExampleTypeReference };
        },
        options: { filterWriteOnly?: boolean } = {}
    ): unknown {
        const typeId = namedShape.typeName.typeId;
        const innerShape = namedShape.shape;

        switch (innerShape.type) {
            case "object":
                return this.filterObjectExample(typeId, innerShape.properties, options);

            case "alias":
                return this.filterExampleTypeReference(innerShape.value, options);

            case "enum":
                return innerShape.value.wireValue;

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
        properties: Array<{ name: { wireValue: string }; value: ExampleTypeReference }>,
        options: { filterWriteOnly?: boolean } = {}
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
            if (propertiesToFilter.has(prop.name.wireValue)) {
                continue;
            }
            const filteredValue = this.filterExampleTypeReference(prop.value, options);

            // Omit null values for properties that are optional-but-not-nullable
            // since the SDK won't serialize those nulls (JsonIgnoreCondition.WhenWritingNull)
            if (filteredValue === null && !nullableNames.has(prop.name.wireValue)) {
                continue;
            }
            result[prop.name.wireValue] = filteredValue;
        }
        return result;
    }

    /**
     * Filters properties from a union example.
     */
    private filterUnionExample(
        typeId: TypeId,
        unionShape: { discriminant: { wireValue: string }; singleUnionType: unknown },
        options: { filterWriteOnly?: boolean } = {}
    ): unknown {
        // Union examples have a complex structure
        // The singleUnionType has a wireDiscriminantValue and a shape that describes the variant
        const singleUnionType = unionShape.singleUnionType as {
            wireDiscriminantValue: { wireValue: string };
            shape:
                | {
                      type: "samePropertiesAsObject";
                      typeId: TypeId;
                      object: { properties: Array<{ name: { wireValue: string }; value: ExampleTypeReference }> };
                  }
                | ({ type: "singleProperty" } & ExampleTypeReference)
                | { type: "noProperties" };
        };

        const result: Record<string, unknown> = {
            [unionShape.discriminant.wireValue]: singleUnionType.wireDiscriminantValue.wireValue
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
                singleUnionType.wireDiscriminantValue.wireValue
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
                    (t) => t.discriminantValue.wireValue === discriminantWireValue
                );
                if (matchingType?.shape.propertiesType === "singleProperty") {
                    return matchingType.shape.name.wireValue;
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
            properties?: Array<{ name: { wireValue: string }; propertyAccess?: string }>;
            extendedProperties?: Array<{ name: { wireValue: string }; propertyAccess?: string }>;
        };
    }): Set<string> {
        const readOnlyNames = new Set<string>();
        const shape = typeDeclaration.shape;

        if (shape.type !== "object" || !shape.properties) {
            return readOnlyNames;
        }

        for (const prop of shape.properties) {
            if (prop.propertyAccess === FernIr.ObjectPropertyAccess.ReadOnly) {
                readOnlyNames.add(prop.name.wireValue);
            }
        }

        if (shape.extendedProperties) {
            for (const prop of shape.extendedProperties) {
                if (prop.propertyAccess === FernIr.ObjectPropertyAccess.ReadOnly) {
                    readOnlyNames.add(prop.name.wireValue);
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
            properties?: Array<{ name: { wireValue: string }; propertyAccess?: string }>;
            extendedProperties?: Array<{ name: { wireValue: string }; propertyAccess?: string }>;
        };
    }): Set<string> {
        const writeOnlyNames = new Set<string>();
        const shape = typeDeclaration.shape;

        if (shape.type !== "object" || !shape.properties) {
            return writeOnlyNames;
        }

        for (const prop of shape.properties) {
            if (prop.propertyAccess === FernIr.ObjectPropertyAccess.WriteOnly) {
                writeOnlyNames.add(prop.name.wireValue);
            }
        }

        if (shape.extendedProperties) {
            for (const prop of shape.extendedProperties) {
                if (prop.propertyAccess === FernIr.ObjectPropertyAccess.WriteOnly) {
                    writeOnlyNames.add(prop.name.wireValue);
                }
            }
        }

        return writeOnlyNames;
    }

    /**
     * Gets the set of nullable property wire names for a type declaration.
     * A property is nullable if its type is a nullable container or optional<nullable<T>>.
     */
    private getNullablePropertyNamesForType(typeDeclaration: {
        shape: {
            type: string;
            properties?: Array<{ name: { wireValue: string }; valueType: TypeReference }>;
            extendedProperties?: Array<{ name: { wireValue: string }; valueType: TypeReference }>;
        };
    }): Set<string> {
        const nullableNames = new Set<string>();
        const shape = typeDeclaration.shape;

        if (shape.type !== "object" || !shape.properties) {
            return nullableNames;
        }

        for (const prop of shape.properties) {
            if (this.context.isNullable(prop.valueType)) {
                nullableNames.add(prop.name.wireValue);
            }
        }

        if (shape.extendedProperties) {
            for (const prop of shape.extendedProperties) {
                if (this.context.isNullable(prop.valueType)) {
                    nullableNames.add(prop.name.wireValue);
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
