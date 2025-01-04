import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { HttpEndpointReferenceParser } from "@fern-api/fern-definition-schema";

import { FernGeneratorExec } from "../GeneratorNotificationService";
import { DiscriminatedUnionTypeInstance } from "./DiscriminatedUnionTypeInstance";
import { ErrorReporter, Severity } from "./ErrorReporter";
import { TypeInstance } from "./TypeInstance";

export abstract class AbstractDynamicSnippetsGeneratorContext {
    public config: FernGeneratorExec.GeneratorConfig;
    public errors: ErrorReporter;

    private _ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    private httpEndpointReferenceParser: HttpEndpointReferenceParser;

    constructor({
        ir,
        config
    }: {
        ir: FernIr.dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
    }) {
        this._ir = ir;
        this.config = config;
        this.errors = new ErrorReporter();
        this.httpEndpointReferenceParser = new HttpEndpointReferenceParser();
    }

    public associateQueryParametersByWireValue({
        parameters,
        values
    }: {
        parameters: FernIr.dynamic.NamedParameter[];
        values: FernIr.dynamic.Values;
    }): TypeInstance[] {
        const instances: TypeInstance[] = [];
        for (const [key, value] of Object.entries(values)) {
            this.errors.scope(key);
            try {
                const parameter = parameters.find((param) => param.name.wireValue === key);
                if (parameter == null) {
                    throw this.newParameterNotRecognizedError(key);
                }
                // If this query parameter supports allow-multiple, the user-provided values
                // must be wrapped in an array.
                const typeInstanceValue =
                    this.isListTypeReference(parameter.typeReference) && !Array.isArray(value) ? [value] : value;
                instances.push({
                    name: parameter.name,
                    typeReference: parameter.typeReference,
                    value: typeInstanceValue
                });
            } finally {
                this.errors.unscope();
            }
        }
        return instances;
    }

    public associateByWireValue({
        parameters,
        values,
        ignoreMissingParameters
    }: {
        parameters: FernIr.dynamic.NamedParameter[];
        values: FernIr.dynamic.Values;
        ignoreMissingParameters?: boolean;
    }): TypeInstance[] {
        const instances: TypeInstance[] = [];
        for (const [key, value] of Object.entries(values)) {
            this.errors.scope(key);
            try {
                const parameter = parameters.find((param) => param.name.wireValue === key);
                if (parameter == null) {
                    if (ignoreMissingParameters) {
                        // Required for request payloads that include more information than
                        // just the target parameters (e.g. union base properties).
                        continue;
                    }
                    this.errors.add({
                        severity: Severity.Critical,
                        message: this.newParameterNotRecognizedError(key).message
                    });
                    continue;
                }
                instances.push({
                    name: parameter.name,
                    typeReference: parameter.typeReference,
                    value
                });
            } finally {
                this.errors.unscope();
            }
        }
        return instances;
    }

    public getRecord(value: unknown): Record<string, unknown> | undefined {
        if (typeof value !== "object" || Array.isArray(value)) {
            this.errors.add({
                severity: Severity.Critical,
                message: `Expected object with key, value pairs but got: ${
                    Array.isArray(value) ? "array" : typeof value
                }`
            });
            return undefined;
        }
        if (value == null) {
            return {};
        }
        return value as Record<string, unknown>;
    }

    public resolveNamedType({ typeId }: { typeId: FernIr.TypeId }): FernIr.dynamic.NamedType | undefined {
        const namedType = this._ir.types[typeId];
        if (namedType == null) {
            this.errors.add({
                severity: Severity.Critical,
                message: `Type identified by "${typeId}" could not be found`
            });
            return undefined;
        }
        return namedType;
    }

    public resolveDiscriminatedUnionTypeInstance({
        discriminatedUnion,
        value
    }: {
        discriminatedUnion: FernIr.dynamic.DiscriminatedUnionType;
        value: unknown;
    }): DiscriminatedUnionTypeInstance | undefined {
        const record = this.getRecord(value);
        if (record == null) {
            return undefined;
        }

        const discriminantFieldName = discriminatedUnion.discriminant.wireValue;
        const discriminantValue = record[discriminantFieldName];
        if (discriminantValue == null) {
            this.errors.add({
                severity: Severity.Critical,
                message: this.newParameterNotRecognizedError(discriminantFieldName).message
            });
            return undefined;
        }
        if (typeof discriminantValue !== "string") {
            this.errors.add({
                severity: Severity.Critical,
                message: `Expected discriminant value to be a string but got: ${typeof discriminantValue}`
            });
            return undefined;
        }

        const singleDiscriminatedUnionType = discriminatedUnion.types[discriminantValue];
        if (singleDiscriminatedUnionType == null) {
            this.errors.add({
                severity: Severity.Critical,
                message: `No type found for discriminant value "${discriminantValue}"`
            });
            return undefined;
        }

        // Remove the discriminant from the record so that the value is valid for the type.
        const { [discriminantFieldName]: _, ...filtered } = record;

        return {
            singleDiscriminatedUnionType,
            discriminantValue: singleDiscriminatedUnionType.discriminantValue,
            value: filtered
        };
    }

    public resolveEndpointOrThrow(rawEndpoint: string): FernIr.dynamic.Endpoint[] {
        const parsedEndpoint = this.httpEndpointReferenceParser.tryParse(rawEndpoint);
        if (parsedEndpoint == null) {
            throw new Error(`Failed to parse endpoint reference "${rawEndpoint}"`);
        }
        return this.resolveEndpointLocationOrThrow(parsedEndpoint);
    }

    public resolveEndpointLocationOrThrow(location: FernIr.dynamic.EndpointLocation): FernIr.dynamic.Endpoint[] {
        const endpoints: FernIr.dynamic.Endpoint[] = [];
        for (const endpoint of Object.values(this._ir.endpoints)) {
            if (this.parsedEndpointMatches({ endpoint, parsedEndpoint: location })) {
                endpoints.push(endpoint);
            }
        }
        if (endpoints.length === 0) {
            throw new Error(`Failed to find endpoint identified by "${location.method} ${location.path}"`);
        }
        return endpoints;
    }

    public fileUploadHasBodyProperties({ fileUpload }: { fileUpload: FernIr.dynamic.FileUploadRequestBody }): boolean {
        return fileUpload.properties.some((property) => {
            switch (property.type) {
                case "file":
                case "fileArray":
                    return false;
                case "bodyProperty":
                    return true;
                default:
                    assertNever(property);
            }
        });
    }

    public fileUploadHasFileProperties({ fileUpload }: { fileUpload: FernIr.dynamic.FileUploadRequestBody }): boolean {
        return fileUpload.properties.some((property) => {
            switch (property.type) {
                case "file":
                case "fileArray":
                    return true;
                case "bodyProperty":
                    return false;
                default:
                    assertNever(property);
            }
        });
    }

    public isFileUploadRequestBody(
        body: FernIr.dynamic.InlinedRequestBody
    ): body is FernIr.dynamic.InlinedRequestBody.FileUpload {
        switch (body.type) {
            case "fileUpload":
                return true;
            case "properties":
            case "referenced":
                return false;
            default:
                assertNever(body);
        }
    }

    public isSingleEnvironmentID(environment: FernIr.dynamic.EnvironmentValues): environment is FernIr.EnvironmentId {
        return typeof environment === "string";
    }

    public isMultiEnvironmentValues(
        environment: FernIr.dynamic.EnvironmentValues
    ): environment is FernIr.dynamic.MultipleEnvironmentUrlValues {
        return typeof environment === "object";
    }

    public newParameterNotRecognizedError(parameterName: string): Error {
        return new Error(`"${parameterName}" is not a recognized parameter for this endpoint`);
    }

    private isListTypeReference(typeReference: FernIr.dynamic.TypeReference): boolean {
        if (typeReference.type === "optional") {
            return this.isListTypeReference(typeReference.value);
        }
        return typeReference.type === "list" || typeReference.type === "set";
    }

    private parsedEndpointMatches({
        endpoint,
        parsedEndpoint
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        parsedEndpoint: HttpEndpointReferenceParser.Parsed;
    }): boolean {
        return endpoint.location.method === parsedEndpoint.method && endpoint.location.path === parsedEndpoint.path;
    }
}
