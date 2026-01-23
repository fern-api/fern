import { ast, text, WithGeneration } from "@fern-api/csharp-codegen";
import {
    ExampleEndpointCall,
    ExampleRequestBody,
    ExampleTypeReference,
    HttpEndpoint,
    ObjectPropertyAccess,
    TypeId
} from "@fern-fern/ir-sdk/api";
import { getContentTypeFromRequestBody } from "../../endpoint/utils/getContentTypeFromRequestBody";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

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

    public generateForExamples(endpoint: HttpEndpoint, examples: ExampleEndpointCall[]): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            examples.forEach((example, index) => {
                const suffix = examples.length === 1 ? "" : `_${index}`;
                let responseSupported = false;
                let jsonExampleResponse: unknown | undefined = undefined;
                if (example.response != null) {
                    if (example.response.type !== "ok" || example.response.value.type !== "body") {
                        throw new Error("Unexpected error response type");
                    }
                    jsonExampleResponse = example.response.value.value?.jsonExample;
                }
                const responseBodyType = endpoint.response?.body?.type;
                // whether or not we support this response type in this generator; the example json may
                // have a response that we can return, but our generated method actually returns void
                responseSupported =
                    jsonExampleResponse != null && (responseBodyType === "json" || responseBodyType === "text");

                if (example.request != null) {
                    // Filter out read-only properties from the request JSON
                    // Read-only properties are not serialized by the SDK, so they should not be
                    // included in the mock server's expected request body
                    const filteredRequestJson = this.filterReadOnlyPropertiesFromExample(example.request);

                    writer.writeLine(`const string requestJson${suffix} = """`);
                    writer.writeLine(
                        JSON.stringify(filteredRequestJson, text.normalizeDates, 2).replace(
                            /"\\{1,2}\$ref"/g,
                            '"$ref\"'
                        )
                    );
                    writer.writeTextStatement('"""');
                }
                writer.newLine();

                if (jsonExampleResponse != null) {
                    if (responseBodyType === "json") {
                        writer.writeLine(`const string mockResponse${suffix} = """`);
                        writer.writeLine(
                            JSON.stringify(jsonExampleResponse, text.normalizeDates, 2).replace(
                                /"\\{1,2}\$ref"/g,
                                '"$ref\"'
                            )
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
                const requestContentType = getContentTypeFromRequestBody(endpoint);
                if (requestContentType) {
                    writer.write(`.WithHeader("Content-Type", "${requestContentType}")`);
                }

                writer.write(
                    `.Using${endpoint.method.charAt(0).toUpperCase()}${endpoint.method.slice(1).toLowerCase()}()`
                );
                if (example.request != null) {
                    if (typeof example.request.jsonExample !== "object") {
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
     * Filters out read-only properties from an example request body.
     * Uses the jsonExample directly to preserve any modifications made by other code
     * (e.g., OAuth credential placeholders set by deepSetProperty).
     * Only filters out read-only properties when necessary.
     */
    private filterReadOnlyPropertiesFromExample(exampleRequest: ExampleRequestBody): unknown {
        if (exampleRequest.type === "inlinedRequestBody") {
            return this.filterInlinedRequestBody(exampleRequest);
        } else {
            // exampleRequest.type === "reference"
            // For reference request bodies, use the jsonExample directly to preserve
            // any modifications made by other code (e.g., deepSetProperty for OAuth credentials).
            // We still need to filter out read-only properties if the referenced type has any.
            return this.filterReferenceRequestBody(exampleRequest);
        }
    }

    /**
     * Filters read-only properties from a reference request body.
     * For types with read-only properties (directly or in nested types), uses recursive filtering.
     * For types without read-only properties, returns jsonExample directly to preserve any modifications.
     */
    private filterReferenceRequestBody(exampleRequest: ExampleRequestBody.Reference): unknown {
        // Check if this type or any nested types have read-only properties
        // If not, return the jsonExample directly to preserve any modifications (e.g., OAuth credentials)
        if (!this.typeHasReadOnlyProperties(exampleRequest.shape)) {
            return exampleRequest.jsonExample;
        }

        // Otherwise, use recursive filtering to remove read-only properties
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
     * Filters read-only properties from an inlined request body.
     * Recursively filters read-only properties from nested objects.
     */
    private filterInlinedRequestBody(exampleRequest: ExampleRequestBody.InlinedRequestBody): Record<string, unknown> {
        const result: Record<string, unknown> = {};

        for (const prop of exampleRequest.properties) {
            // Check if this property is read-only by looking up the original type declaration
            if (this.isPropertyReadOnly(prop.name.wireValue, prop.originalTypeDeclaration)) {
                continue;
            }
            // Recursively filter the property value
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
            if (prop.name.wireValue === wireValue && prop.propertyAccess === ObjectPropertyAccess.ReadOnly) {
                return true;
            }
        }

        // Check extended properties
        if (typeDeclaration.shape.extendedProperties) {
            for (const prop of typeDeclaration.shape.extendedProperties) {
                if (prop.name.wireValue === wireValue && prop.propertyAccess === ObjectPropertyAccess.ReadOnly) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Filters read-only properties from an example type reference.
     * Recursively handles containers (optional, list, map, etc.) and named types.
     */
    private filterExampleTypeReference(exampleTypeRef: ExampleTypeReference): unknown {
        const shape = exampleTypeRef.shape;

        switch (shape.type) {
            case "primitive":
            case "unknown":
                return exampleTypeRef.jsonExample;

            case "container":
                // For literal containers, just return the jsonExample value directly
                // since the literal value is already the correct wire value
                if (shape.container.type === "literal") {
                    return exampleTypeRef.jsonExample;
                }
                return this.filterContainerExample(shape.container);

            case "named":
                return this.filterNamedExample(shape);
        }
    }

    /**
     * Filters read-only properties from a container example (optional, list, map, etc.).
     */
    private filterContainerExample(
        container:
            | { type: "list"; list: ExampleTypeReference[] }
            | { type: "set"; set: ExampleTypeReference[] }
            | { type: "optional"; optional: ExampleTypeReference | undefined }
            | { type: "nullable"; nullable: ExampleTypeReference | undefined }
            | { type: "map"; map: Array<{ key: ExampleTypeReference; value: ExampleTypeReference }> }
            | { type: "literal"; literal: unknown }
    ): unknown {
        switch (container.type) {
            case "list":
                return container.list.map((item) => this.filterExampleTypeReference(item));

            case "set":
                return container.set.map((item) => this.filterExampleTypeReference(item));

            case "optional":
                if (container.optional == null) {
                    return null;
                }
                return this.filterExampleTypeReference(container.optional);

            case "nullable":
                if (container.nullable == null) {
                    return null;
                }
                return this.filterExampleTypeReference(container.nullable);

            case "map": {
                const mapResult: Record<string, unknown> = {};
                for (const entry of container.map) {
                    const key = entry.key.jsonExample;
                    // JSON object keys are always strings, but the example might have numeric keys
                    if (typeof key === "string" || typeof key === "number") {
                        mapResult[String(key)] = this.filterExampleTypeReference(entry.value);
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
     * Filters read-only properties from a named type example.
     */
    private filterNamedExample(namedShape: {
        type: "named";
        typeName: { typeId: TypeId };
        shape:
            | { type: "object"; properties: Array<{ name: { wireValue: string }; value: ExampleTypeReference }> }
            | { type: "union"; discriminant: { wireValue: string }; singleUnionType: unknown }
            | { type: "enum"; value: { wireValue: string } }
            | { type: "alias"; value: ExampleTypeReference }
            | { type: "undiscriminatedUnion"; index: number; singleUnionType: ExampleTypeReference };
    }): unknown {
        const typeId = namedShape.typeName.typeId;
        const innerShape = namedShape.shape;

        switch (innerShape.type) {
            case "object":
                return this.filterObjectExample(typeId, innerShape.properties);

            case "alias":
                return this.filterExampleTypeReference(innerShape.value);

            case "enum":
                return innerShape.value.wireValue;

            case "union":
                // For unions, we need to handle the discriminant and the union value
                return this.filterUnionExample(innerShape);

            case "undiscriminatedUnion":
                return this.filterExampleTypeReference(innerShape.singleUnionType);
        }
    }

    /**
     * Filters read-only properties from an object example.
     */
    private filterObjectExample(
        typeId: TypeId,
        properties: Array<{ name: { wireValue: string }; value: ExampleTypeReference }>
    ): Record<string, unknown> {
        const typeDeclaration = this.context.model.dereferenceType(typeId).typeDeclaration;
        const readOnlyNames = this.getReadOnlyPropertyNamesForType(typeDeclaration);

        const result: Record<string, unknown> = {};
        for (const prop of properties) {
            if (readOnlyNames.has(prop.name.wireValue)) {
                continue;
            }
            result[prop.name.wireValue] = this.filterExampleTypeReference(prop.value);
        }
        return result;
    }

    /**
     * Filters read-only properties from a union example.
     */
    private filterUnionExample(unionShape: { discriminant: { wireValue: string }; singleUnionType: unknown }): unknown {
        // Union examples have a complex structure - for now, return the JSON example
        // and rely on the SDK's serialization to handle read-only properties
        const singleUnionType = unionShape.singleUnionType as {
            wireDiscriminantValue: { wireValue: string };
            shape:
                | {
                      type: "samePropertiesAsObject";
                      typeId: TypeId;
                      object: { properties: Array<{ name: { wireValue: string }; value: ExampleTypeReference }> };
                  }
                | { type: "singleProperty"; jsonExample: unknown; typeReference: ExampleTypeReference }
                | { type: "noProperties" };
        };

        const result: Record<string, unknown> = {
            [unionShape.discriminant.wireValue]: singleUnionType.wireDiscriminantValue.wireValue
        };

        if (singleUnionType.shape.type === "samePropertiesAsObject") {
            const filteredProps = this.filterObjectExample(
                singleUnionType.shape.typeId,
                singleUnionType.shape.object.properties
            );
            Object.assign(result, filteredProps);
        } else if (singleUnionType.shape.type === "singleProperty") {
            // Single property unions have a nested value
            const filteredValue = this.filterExampleTypeReference(singleUnionType.shape.typeReference);
            // The property name for single property unions is typically the variant name
            // but we need to check the union definition for the actual wire name
            Object.assign(result, filteredValue);
        }

        return result;
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
            if (prop.propertyAccess === ObjectPropertyAccess.ReadOnly) {
                readOnlyNames.add(prop.name.wireValue);
            }
        }

        if (shape.extendedProperties) {
            for (const prop of shape.extendedProperties) {
                if (prop.propertyAccess === ObjectPropertyAccess.ReadOnly) {
                    readOnlyNames.add(prop.name.wireValue);
                }
            }
        }

        return readOnlyNames;
    }
}
