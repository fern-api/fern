import { assertNever, keys } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { HttpEndpointReferenceParser } from "@fern-api/fern-definition-schema";

import { FernGeneratorExec } from "../GeneratorNotificationService";
import { DiscriminatedUnionTypeInstance } from "./DiscriminatedUnionTypeInstance";
import { ErrorReporter, Severity } from "./ErrorReporter";
import { Options } from "./Options";
import { TypeInstance } from "./TypeInstance";
import { DynamicSnippetsGeneratorContextLike, EndpointLike, EndpointLocationLike } from "./types";

export abstract class AbstractDynamicSnippetsGeneratorContext<EndpointT extends EndpointLike = FernIr.dynamic.Endpoint>
    implements DynamicSnippetsGeneratorContextLike<EndpointT>
{
    public config: FernGeneratorExec.GeneratorConfig;
    public options: Options;
    public errors: ErrorReporter;

    private _ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    private httpEndpointReferenceParser: HttpEndpointReferenceParser;

    constructor({
        ir,
        config,
        options = {}
    }: {
        ir: FernIr.dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
        options?: Options;
    }) {
        this._ir = ir;
        this.config = config;
        this.options = options;
        this.errors = new ErrorReporter();
        this.httpEndpointReferenceParser = new HttpEndpointReferenceParser();
    }

    public abstract clone(): AbstractDynamicSnippetsGeneratorContext<EndpointT>;

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

    public associateByWireValueOrDefault({
        parameters,
        values
    }: {
        parameters: FernIr.dynamic.NamedParameter[];
        values: FernIr.dynamic.Values;
    }): TypeInstance[] {
        const instances: TypeInstance[] = [];
        for (const parameter of parameters) {
            this.errors.scope(parameter.name.wireValue);
            try {
                let value = values[parameter.name.wireValue];

                if (value == null) {
                    if (parameter.typeReference.type === "primitive" && parameter.typeReference.value === "STRING") {
                        // synthesize a parameter value for string parameters that are missing data
                        value = `<${parameter.name.wireValue}>`;
                    } else {
                        this.errors.add({
                            severity: Severity.Critical,
                            message: this.newParameterNotRecognizedError(parameter.name.wireValue).message
                        });
                        continue;
                    }
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

    /**
     * Similar to `associateByWireValue` but it builds TypeInstance objects by iterating over schema parameters rather
     * than snippet values. Skips non-nullable parameters that are missing from the snippet object.
     */
    public getExampleObjectProperties({
        parameters,
        snippetObject
    }: {
        parameters: FernIr.dynamic.NamedParameter[];
        snippetObject: unknown;
    }): TypeInstance[] {
        const objectRecord = (
            typeof snippetObject === "object" && snippetObject !== null && !Array.isArray(snippetObject)
                ? snippetObject
                : {}
        ) as Record<string, unknown>;
        const instances: TypeInstance[] = [];
        for (const parameter of parameters) {
            const value = objectRecord[parameter.name.wireValue];
            if (value == null) {
                if (parameter.typeReference.type === "nullable") {
                    instances.push({
                        name: parameter.name,
                        typeReference: parameter.typeReference,
                        value: null
                    });
                }
            } else {
                instances.push({
                    name: parameter.name,
                    typeReference: parameter.typeReference,
                    value
                });
            }
        }
        return instances;
    }

    public getSingleFileValue({
        property,
        record
    }: {
        property: FernIr.dynamic.FileUploadRequestBodyProperty.File_;
        record: Record<string, unknown>;
    }): string | undefined {
        const fileValue = record[property.wireValue];
        if (fileValue == null) {
            return undefined;
        }
        if (typeof fileValue !== "string") {
            this.errors.add({
                severity: Severity.Critical,
                message: `Expected file value to be a string, got ${typeof fileValue}`
            });
            return undefined;
        }
        return fileValue;
    }

    public getFileArrayValues({
        property,
        record
    }: {
        property: FernIr.dynamic.FileUploadRequestBodyProperty.FileArray;
        record: Record<string, unknown>;
    }): string[] | undefined {
        const fileArrayValue = record[property.wireValue];
        if (fileArrayValue == null) {
            return undefined;
        }
        if (!Array.isArray(fileArrayValue)) {
            this.errors.add({
                severity: Severity.Critical,
                message: `Expected file array value to be an array of strings, got ${typeof fileArrayValue}`
            });
            return undefined;
        }
        const stringValues: string[] = [];
        for (const value of fileArrayValue) {
            if (typeof value !== "string") {
                this.errors.add({
                    severity: Severity.Critical,
                    message: `Expected file array value to be an array of strings, got ${typeof value}`
                });
                return undefined;
            }
            stringValues.push(value);
        }
        return stringValues;
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

    public resolveNamedType({ typeId }: { typeId: FernIr.dynamic.TypeId }): FernIr.dynamic.NamedType | undefined {
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
        return this.resolveEndpointLocation(parsedEndpoint);
    }

    public resolveEndpointLocation(location: EndpointLocationLike): FernIr.dynamic.Endpoint[] {
        const endpoints: FernIr.dynamic.Endpoint[] = [];
        for (const endpoint of Object.values(this._ir.endpoints)) {
            if (endpoint.location.method === location.method && endpoint.location.path === location.path) {
                endpoints.push(endpoint);
            }
        }

        return endpoints;
    }

    public resolveEndpointLocationOrThrow(location: EndpointLocationLike): EndpointT[] {
        const endpoints = this.resolveEndpointLocation(location);
        if (endpoints.length === 0) {
            throw new Error(`Failed to find endpoint identified by "${location.method} ${location.path}"`);
        }
        return endpoints as unknown as EndpointT[];
    }

    public needsRequestParameter({
        request,
        inlinePathParameters,
        inlineFileProperties
    }: {
        request: FernIr.dynamic.InlinedRequest;
        inlinePathParameters: boolean;
        inlineFileProperties: boolean;
    }): boolean {
        if (this.includePathParametersInWrappedRequest({ request, inlinePathParameters })) {
            return true;
        }
        if (request.queryParameters != null && request.queryParameters.length > 0) {
            return true;
        }
        if (request.headers != null && request.headers.length > 0) {
            return true;
        }
        if (request.body != null) {
            return this.includeRequestBodyInWrappedRequest({ body: request.body, inlineFileProperties });
        }
        if (request.metadata?.onlyPathParameters) {
            return false;
        }
        return true;
    }

    public includePathParametersInWrappedRequest({
        request,
        inlinePathParameters
    }: {
        request: FernIr.dynamic.InlinedRequest;
        inlinePathParameters: boolean;
    }): boolean {
        return inlinePathParameters && (request.metadata?.includePathParameters ?? false);
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

    public resolveEnvironmentName(environmentID: string): FernIr.Name | undefined {
        if (this._ir.environments == null) {
            return undefined;
        }
        const environments = this._ir.environments.environments;
        switch (environments.type) {
            case "singleBaseUrl": {
                const environment = environments.environments.find((env) => env.id === environmentID);
                if (environment == null) {
                    return undefined;
                }
                return environment.name;
            }
            case "multipleBaseUrls": {
                const environment = environments.environments.find((env) => env.id === environmentID);
                if (environment == null) {
                    return undefined;
                }
                return environment.name;
            }
            default:
                assertNever(environments);
        }
    }

    public isSingleEnvironmentID(
        environment: FernIr.dynamic.EnvironmentValues
    ): environment is FernIr.dynamic.EnvironmentId {
        return typeof environment === "string";
    }

    public isMultiEnvironmentValues(
        environment: FernIr.dynamic.EnvironmentValues
    ): environment is FernIr.dynamic.MultipleEnvironmentUrlValues {
        return typeof environment === "object";
    }

    public validateMultiEnvironmentUrlValues(
        multiEnvironmentUrlValues: FernIr.dynamic.MultipleEnvironmentUrlValues
    ): boolean {
        if (this._ir.environments == null) {
            this.errors.add({
                severity: Severity.Critical,
                message:
                    "Multiple environments are not supported for single base URL environments; use the baseUrl option instead"
            });
            return false;
        }
        const environments = this._ir.environments.environments;
        switch (environments.type) {
            case "singleBaseUrl": {
                this.errors.add({
                    severity: Severity.Critical,
                    message:
                        "Multiple environments are not supported for single base URL environments; use the baseUrl option instead"
                });
                return false;
            }
            case "multipleBaseUrls": {
                const firstEnvironment = environments.environments[0];
                if (firstEnvironment == null) {
                    this.errors.add({
                        severity: Severity.Critical,
                        message: "Multiple environments are not supported; use the baseUrl option instead"
                    });
                    return false;
                }
                const expectedKeys = new Set(keys(firstEnvironment.urls));
                for (const key of keys(multiEnvironmentUrlValues)) {
                    if (expectedKeys.has(key)) {
                        expectedKeys.delete(key);
                    }
                }
                if (expectedKeys.size > 0) {
                    this.errors.add({
                        severity: Severity.Critical,
                        message: `The provided environments are invalid; got: [${Object.keys(multiEnvironmentUrlValues).join(", ")}], expected: [${keys(firstEnvironment.urls).join(", ")}]`
                    });
                    return false;
                }
                return true;
            }
        }
    }

    public getValueAsNumber({ value }: { value: unknown }): number | undefined {
        if (typeof value !== "number") {
            this.errors.add({
                severity: Severity.Critical,
                message: this.newTypeMismatchError({ expected: "number", value }).message
            });
            return undefined;
        }
        return value;
    }

    public getValueAsBoolean({ value }: { value: unknown }): boolean | undefined {
        if (typeof value !== "boolean") {
            this.errors.add({
                severity: Severity.Critical,
                message: this.newTypeMismatchError({ expected: "boolean", value }).message
            });
            return undefined;
        }
        return value;
    }

    public getValueAsString({ value }: { value: unknown }): string | undefined {
        if (typeof value !== "string") {
            this.errors.add({
                severity: Severity.Critical,
                message: this.newTypeMismatchError({ expected: "string", value }).message
            });
            return undefined;
        }
        return value;
    }

    public isOptional(typeReference: FernIr.dynamic.TypeReference): boolean {
        switch (typeReference.type) {
            case "nullable":
                return this.isOptional(typeReference.value);
            case "optional":
                return true;
            case "named": {
                const resolvedType = this.resolveNamedType({ typeId: typeReference.value });
                if (resolvedType == null) {
                    return false;
                }
                if (resolvedType.type === "alias") {
                    return this.isNullable(resolvedType.typeReference);
                }
                return false;
            }
        }
        return false;
    }

    public isNullable(typeReference: FernIr.dynamic.TypeReference): boolean {
        switch (typeReference.type) {
            case "nullable":
                return true;
            case "optional":
                return this.isNullable(typeReference.value);
            case "named": {
                const resolvedType = this.resolveNamedType({ typeId: typeReference.value });
                if (resolvedType == null) {
                    return false;
                }
                if (resolvedType.type === "alias") {
                    return this.isNullable(resolvedType.typeReference);
                }
                return false;
            }
        }
        return false;
    }

    public newAuthMismatchError({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth;
        values: FernIr.dynamic.AuthValues;
    }): Error {
        return new Error(`Expected auth type ${auth.type}, got ${values.type}`);
    }

    public newParameterNotRecognizedError(parameterName: string): Error {
        return new Error(`"${parameterName}" is not a recognized parameter for this endpoint`);
    }

    public newTypeMismatchError({ expected, value }: { expected: string; value: unknown }): Error {
        return new Error(`Expected ${expected}, got ${typeof value}`);
    }

    private includeRequestBodyInWrappedRequest({
        body,
        inlineFileProperties
    }: {
        body: FernIr.dynamic.InlinedRequestBody;
        inlineFileProperties: boolean;
    }): boolean {
        switch (body.type) {
            case "properties":
            case "referenced":
                return true;
            case "fileUpload":
                return this.includeFileUploadBodyInWrappedRequest({ fileUpload: body, inlineFileProperties });
            default:
                assertNever(body);
        }
    }

    private includeFileUploadBodyInWrappedRequest({
        fileUpload,
        inlineFileProperties
    }: {
        fileUpload: FernIr.dynamic.FileUploadRequestBody;
        inlineFileProperties: boolean;
    }): boolean {
        return (
            this.fileUploadHasBodyProperties({ fileUpload }) ||
            (inlineFileProperties && this.fileUploadHasFileProperties({ fileUpload }))
        );
    }

    private fileUploadHasBodyProperties({ fileUpload }: { fileUpload: FernIr.dynamic.FileUploadRequestBody }): boolean {
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

    private fileUploadHasFileProperties({ fileUpload }: { fileUpload: FernIr.dynamic.FileUploadRequestBody }): boolean {
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
