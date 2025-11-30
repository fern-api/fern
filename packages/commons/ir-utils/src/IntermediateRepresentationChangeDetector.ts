import { assertNever } from "@fern-api/core-utils";
import {
    ContainerType,
    DeclaredErrorName,
    DeclaredTypeName,
    ErrorDeclaration,
    FernFilepath,
    FileUploadRequest,
    FileUploadRequestProperty,
    HttpEndpoint,
    HttpHeader,
    HttpMethod,
    HttpPath,
    HttpRequestBody,
    HttpRequestBodyReference,
    HttpResponse,
    HttpService,
    InlinedRequestBody,
    IntermediateRepresentation,
    JsonResponse,
    Literal,
    Name,
    NameAndWireValue,
    ObjectProperty,
    PathParameter,
    QueryParameter,
    SingleUnionTypeProperties,
    StreamingResponse,
    Type,
    TypeDeclaration,
    TypeReference
} from "@fern-api/ir-sdk";
import { hashJSON } from "./hashJSON";
import { isMarkedUnstable } from "./utils/availabilityUtils";

export namespace IntermediateRepresentationChangeDetector {
    export type Result = {
        bump: "major" | "minor" | "no_change";
        isBreaking: boolean;
        errors: Error[];
    };

    export type InlinedRequestBody = {
        [name: string]: TypeReference;
    };

    export type FileUploadRequest = {
        [name: string]: "file" | "fileArray" | TypeReference;
    };

    export interface Error {
        message: string;
    }

    export interface InternalIr {
        types: Record<string, TypeDeclaration>;
        errors: Record<string, ErrorDeclaration>;
        services: Record<string, HttpService>;
    }
}

export class ErrorCollector {
    private errors: IntermediateRepresentationChangeDetector.Error[];

    constructor() {
        this.errors = [];
    }

    public add(error: string): void {
        this.errors.push({ message: error });
    }

    public getErrors(): IntermediateRepresentationChangeDetector.Error[] {
        return this.errors;
    }

    public hasErrors(): boolean {
        return this.errors.length > 0;
    }
}

/**
 * Detects breaking changes between intermediate representations of APIs.
 *
 * The breaking change detector is strict; some wire-compatible changes
 * will still result in breaking changes in the generated SDK.
 */
export class IntermediateRepresentationChangeDetector {
    private errors: ErrorCollector;

    constructor() {
        this.errors = new ErrorCollector();
    }

    public async check({
        from,
        to
    }: {
        from: IntermediateRepresentation;
        to: IntermediateRepresentation;
    }): Promise<IntermediateRepresentationChangeDetector.Result> {
        const fromInternal = this.toInternalIr(from);
        const toInternal = this.toInternalIr(to);

        // Hash the pruned IRs to check if they're identical
        const fromHash = hashJSON(fromInternal);
        const toHash = hashJSON(toInternal);

        if (fromHash === toHash) {
            return {
                bump: "no_change",
                isBreaking: false,
                errors: []
            };
        }

        const result = this.checkBreaking({ from: fromInternal, to: toInternal });
        return {
            bump: result.isBreaking ? "major" : "minor",
            isBreaking: result.isBreaking,
            errors: result.errors
        };
    }

    private toInternalIr(ir: IntermediateRepresentation): IntermediateRepresentationChangeDetector.InternalIr {
        return {
            types: ir.types,
            errors: ir.errors,
            services: ir.services
        };
    }

    private checkBreaking({
        from,
        to
    }: {
        from: IntermediateRepresentationChangeDetector.InternalIr;
        to: IntermediateRepresentationChangeDetector.InternalIr;
    }): IntermediateRepresentationChangeDetector.Result {
        this.checkTypeBreakingChanges({
            from: from.types,
            to: to.types
        });
        this.checkErrorsBreakingChanges({
            from: from.errors,
            to: to.errors
        });
        this.checkServicesBreakingChanges({
            from: from.services,
            to: to.services
        });
        const isBreaking = this.errors.hasErrors();
        return {
            bump: isBreaking ? "major" : "minor",
            isBreaking,
            errors: this.errors.getErrors()
        };
    }

    private checkTypeBreakingChanges({
        from,
        to
    }: {
        from: Record<string, TypeDeclaration>;
        to: Record<string, TypeDeclaration>;
    }): void {
        for (const [typeId, fromType] of Object.entries(from)) {
            if (isMarkedUnstable(fromType.availability)) {
                continue;
            }
            const toType = to[typeId];
            if (!toType) {
                this.errors.add(`Type "${typeId}" was removed.`);
                continue;
            }
            if (isMarkedUnstable(toType.availability)) {
                this.errors.add(`Type "${typeId}" was moved from stable to unstable availability status.`);
                continue;
            }
            if (
                !this.areTypeDeclarationsCompatible({
                    from: fromType,
                    to: toType
                })
            ) {
                this.errors.add(`Type "${typeId}" has an incompatible change.`);
            }
        }
    }

    private checkErrorsBreakingChanges({
        from,
        to
    }: {
        from: Record<string, ErrorDeclaration>;
        to: Record<string, ErrorDeclaration>;
    }): void {
        for (const [_, fromError] of Object.entries(from)) {
            const toError = Object.values(to).find((error) => error.name.errorId === fromError.name.errorId);
            if (!toError) {
                this.errors.add(
                    `Error "${fromError.name.errorId}" with status code "${fromError.statusCode}" was removed.`
                );
                continue;
            }
            this.checkErrorBreakingChanges({
                from: fromError,
                to: toError
            });
        }
    }

    private checkErrorBreakingChanges({ from, to }: { from: ErrorDeclaration; to: ErrorDeclaration }): void {
        if (from.type != null) {
            if (to.type == null) {
                this.errors.add(
                    `Error "${from.name.errorId}" with status code "${from.statusCode}" had its type removed.`
                );
                return;
            }
            if (
                !this.areTypeReferencesCompatible({
                    from: from.type,
                    to: to.type
                })
            ) {
                this.errors.add(`Error "${from.name.errorId}" type reference changed.`);
            }
        }
        if (
            !this.areDeclaredErrorNamesCompatible({
                from: from.name,
                to: to.name
            })
        ) {
            this.errors.add(`Error "${from.name.errorId}" name changed.`);
        }
        if (
            !this.areNameAndWireValuesCompatible({
                from: from.discriminantValue,
                to: to.discriminantValue
            })
        ) {
            this.errors.add(`Error "${from.name.errorId}" discriminant value changed.`);
        }
    }

    private checkServicesBreakingChanges({
        from,
        to
    }: {
        from: Record<string, HttpService>;
        to: Record<string, HttpService>;
    }): void {
        for (const [serviceId, fromService] of Object.entries(from)) {
            if (
                isMarkedUnstable(fromService.availability) ||
                (fromService.endpoints?.every((endpoint) => isMarkedUnstable(endpoint.availability)) ?? false)
            ) {
                continue;
            }

            const toService = to[serviceId];
            if (!toService) {
                this.errors.add(`Service "${serviceId}" was removed.`);
                continue;
            }
            if (isMarkedUnstable(toService.availability)) {
                this.errors.add(`Service "${serviceId}" was moved from stable to unstable availability status.`);
                continue;
            }
            this.checkServiceBreakingChanges({
                id: serviceId,
                from: fromService,
                to: toService
            });
        }
    }

    private checkServiceBreakingChanges({ id, from, to }: { id: string; from: HttpService; to: HttpService }): void {
        this.checkHeadersBreakingChanges({ id, from: from.headers, to: to.headers });
        this.checkEndpointsBreakingChanges({ id, from, to });
    }

    private checkEndpointsBreakingChanges({ id, from, to }: { id: string; from: HttpService; to: HttpService }): void {
        const fromEndpoints = Object.fromEntries(from.endpoints.map((endpoint) => [endpoint.id, endpoint]));
        const toEndpoints = Object.fromEntries(to.endpoints.map((endpoint) => [endpoint.id, endpoint]));
        for (const [endpointId, fromEndpoint] of Object.entries(fromEndpoints)) {
            if (isMarkedUnstable(fromEndpoint.availability)) {
                continue;
            }
            const toEndpoint = toEndpoints[endpointId];
            if (!toEndpoint) {
                this.errors.add(`Endpoint "${endpointId}" was removed.`);
                continue;
            }
            if (isMarkedUnstable(toEndpoint.availability)) {
                this.errors.add(`Endpoint "${endpointId}" was moved from stable to unstable availability status.`);
                continue;
            }
            this.checkEndpointBreakingChanges({ id: endpointId, from: fromEndpoint, to: toEndpoint });
        }
    }

    private checkEndpointBreakingChanges({ id, from, to }: { id: string; from: HttpEndpoint; to: HttpEndpoint }): void {
        this.checkHttpMethodsBreakingChanges({ id, from: from.method, to: to.method });
        this.checkHttpPathsBreakingChanges({ id, from: from.fullPath, to: to.fullPath });
        this.checkPathParametersBreakingChanges({ id, from: from.pathParameters, to: to.pathParameters });
        this.checkQueryParametersBreakingChanges({ id, from: from.queryParameters, to: to.queryParameters });
        this.checkHeadersBreakingChanges({ id, from: from.headers, to: to.headers });

        if (from.requestBody != null) {
            if (to.requestBody != null) {
                this.checkHttpRequestBodiesCompatible({ id, from: from.requestBody, to: to.requestBody });
            } else {
                this.errors.add(`Request body was removed from endpoint "${from.id}".`);
            }
        }

        if (from.response != null) {
            if (to.response != null) {
                this.checkHttpResponseBreakingChanges({ id, from: from.response, to: to.response });
            } else {
                this.errors.add(`Response was removed from endpoint "${from.id}".`);
            }
        }

        if ((from.pagination != null && to.pagination == null) || (from.pagination == null && to.pagination != null)) {
            this.errors.add(
                `Pagination was ${from.pagination != null ? "added" : "removed"} from endpoint "${from.id}".`
            );
        }
    }

    private checkPathParametersBreakingChanges({
        id,
        from,
        to
    }: {
        id: string;
        from: PathParameter[];
        to: PathParameter[];
    }): void {
        const fromPathParams = Object.fromEntries(from.map((param) => [param.name.originalName, param]));
        const toPathParams = Object.fromEntries(to.map((param) => [param.name.originalName, param]));
        for (const [paramName, fromParam] of Object.entries(fromPathParams)) {
            const toParam = toPathParams[paramName];
            if (!toParam) {
                this.errors.add(`Path parameter "${paramName}" was removed from endpoint "${id}".`);
                continue;
            }
            if (!this.areTypeReferencesCompatible({ from: fromParam.valueType, to: toParam.valueType })) {
                this.errors.add(`Path parameter "${paramName}" type changed in endpoint "${id}".`);
            }
        }
    }

    private checkQueryParametersBreakingChanges({
        id,
        from,
        to
    }: {
        id: string;
        from: QueryParameter[];
        to: QueryParameter[];
    }): void {
        const fromQueryParams = Object.fromEntries(from.map((param) => [param.name.wireValue, param]));
        const toQueryParams = Object.fromEntries(to.map((param) => [param.name.wireValue, param]));

        this.checkForNewRequiredTypeReferences({
            from: Object.fromEntries(Object.entries(fromQueryParams).map(([name, param]) => [name, param.valueType])),
            to: Object.fromEntries(Object.entries(toQueryParams).map(([name, param]) => [name, param.valueType]))
        });

        for (const [paramName, fromParam] of Object.entries(fromQueryParams)) {
            const toParam = toQueryParams[paramName];
            if (!toParam) {
                this.errors.add(`Query parameter "${paramName}" was removed from endpoint "${id}".`);
                continue;
            }
            if (!this.areTypeReferencesCompatible({ from: fromParam.valueType, to: toParam.valueType })) {
                this.errors.add(`Query parameter "${paramName}" type changed in endpoint "${id}".`);
            }
            if (fromParam.allowMultiple !== toParam.allowMultiple) {
                this.errors.add(`Query parameter "${paramName}" allow-multiple values changed in endpoint "${id}".`);
            }
        }
    }

    private checkHeadersBreakingChanges({ id, from, to }: { id: string; from: HttpHeader[]; to: HttpHeader[] }): void {
        const fromHeaders = Object.fromEntries(from.map((header) => [header.name.wireValue, header]));
        const toHeaders = Object.fromEntries(to.map((header) => [header.name.wireValue, header]));

        this.checkForNewRequiredTypeReferences({
            from: Object.fromEntries(Object.entries(fromHeaders).map(([name, header]) => [name, header.valueType])),
            to: Object.fromEntries(Object.entries(toHeaders).map(([name, header]) => [name, header.valueType]))
        });

        for (const [headerName, fromHeader] of Object.entries(fromHeaders)) {
            const toHeader = toHeaders[headerName];
            if (!toHeader) {
                this.errors.add(`Header "${headerName}" was removed from ${id}.`);
                continue;
            }
            if (!this.areTypeReferencesCompatible({ from: fromHeader.valueType, to: toHeader.valueType })) {
                this.errors.add(`Header "${headerName}" type changed in ${id}.`);
            }
        }
    }

    private checkHttpMethodsBreakingChanges({ id, from, to }: { id: string; from: HttpMethod; to: HttpMethod }): void {
        if (from === to) {
            return;
        }
        this.errors.add(`HTTP method changed in ${id}.`);
    }

    private checkHttpPathsBreakingChanges({ id, from, to }: { id: string; from: HttpPath; to: HttpPath }): void {
        if (this.areHttpPathsCompatible({ from, to })) {
            return;
        }
        this.errors.add(`HTTP path changed in ${id}.`);
    }

    private areHttpPathsCompatible({ from, to }: { from: HttpPath; to: HttpPath }): boolean {
        if (from.head !== to.head) {
            return false;
        }
        if (from.parts.length !== to.parts.length) {
            return false;
        }
        for (let i = 0; i < from.parts.length; i++) {
            const fromPart = from.parts[i];
            if (fromPart == null) {
                return false;
            }
            const toPart = to.parts[i];
            if (toPart == null) {
                return false;
            }
            if (fromPart.pathParameter !== toPart.pathParameter) {
                return false;
            }
            if (fromPart.tail !== toPart.tail) {
                return false;
            }
        }
        return true;
    }

    private checkHttpRequestBodiesCompatible({
        id,
        from,
        to
    }: {
        id: string;
        from: HttpRequestBody;
        to: HttpRequestBody;
    }): void {
        switch (from.type) {
            case "inlinedRequestBody":
                if (to.type === "inlinedRequestBody") {
                    if (this.areInlinedRequestBodiesCompatible({ from, to })) {
                        return;
                    }
                }
                break;
            case "reference":
                if (to.type === "reference") {
                    if (this.areReferenceRequestBodiesCompatible({ from, to })) {
                        return;
                    }
                }
                break;
            case "fileUpload":
                if (to.type === "fileUpload") {
                    if (this.areFileUploadRequestBodiesCompatible({ from, to })) {
                        return;
                    }
                }
                break;
            case "bytes":
                if (to.type === "bytes") {
                    return;
                }
                break;
            default:
                assertNever(from);
        }
        this.errors.add(`Request body type changed from "${from.type}" to "${to.type}" in endpoint "${id}".`);
    }

    private areInlinedRequestBodiesCompatible({
        from,
        to
    }: {
        from: InlinedRequestBody;
        to: InlinedRequestBody;
    }): boolean {
        const fromRequestBody = this.getInlinedRequestBody(from);
        const toRequestBody = this.getInlinedRequestBody(to);

        this.checkForNewInlinedRequestBodyProperties({ from: fromRequestBody, to: toRequestBody });

        return Object.entries(fromRequestBody).every(([name, fromType]) => {
            const toType = toRequestBody[name];
            if (!toType) {
                this.errors.add(`Request body property "${name}" was removed.`);
                return false;
            }
            return this.areTypeReferencesCompatible({ from: fromType, to: toType });
        });
    }

    private areReferenceRequestBodiesCompatible({
        from,
        to
    }: {
        from: HttpRequestBodyReference;
        to: HttpRequestBodyReference;
    }): boolean {
        return this.areTypeReferencesCompatible({ from: from.requestBodyType, to: to.requestBodyType });
    }

    private areFileUploadRequestBodiesCompatible({
        from,
        to
    }: {
        from: FileUploadRequest;
        to: FileUploadRequest;
    }): boolean {
        const fromRequest = this.getFileUploadRequest(from.properties);
        const toRequest = this.getFileUploadRequest(to.properties);

        this.checkForNewFileUploadRequestProperties({ from: fromRequest, to: toRequest });

        for (const [propName, fromProp] of Object.entries(fromRequest)) {
            const toProp = toRequest[propName];
            if (!toProp) {
                this.errors.add(`File upload property "${propName}" was removed.`);
                return false;
            }
            if (fromProp === "file") {
                if (toProp !== "file") {
                    this.errors.add(`File upload property "${propName}" type changed.`);
                    return false;
                }
            }
            if (fromProp === "fileArray") {
                if (toProp !== "fileArray") {
                    this.errors.add(`File upload property "${propName}" type changed.`);
                    return false;
                }
            }
            if (fromProp !== "file" && fromProp !== "fileArray" && toProp !== "file" && toProp !== "fileArray") {
                if (!this.areTypeReferencesCompatible({ from: fromProp, to: toProp })) {
                    this.errors.add(`File upload property "${propName}" type changed.`);
                    return false;
                }
            }
        }
        return true;
    }

    private checkHttpResponseBreakingChanges({
        id,
        from,
        to
    }: {
        id: string;
        from: HttpResponse;
        to: HttpResponse;
    }): void {
        if (from.statusCode !== to.statusCode) {
            this.errors.add(`Response status code changed from "${from.statusCode}" to "${to.statusCode}".`);
        }
        if (from.body == null && to.body == null) {
            return;
        }
        if (from.body == null || to.body == null) {
            this.errors.add(`Response body was ${from.body == null ? "added" : "removed"}.`);
            return;
        }
        switch (from.body.type) {
            case "json":
                if (to.body.type === "json") {
                    this.areJsonResponsesCompatible({ from: from.body.value, to: to.body.value });
                    return;
                }
                break;
            case "fileDownload":
                if (to.body.type === "fileDownload") {
                    return;
                }
                break;
            case "text":
                if (to.body.type === "text") {
                    return;
                }
                break;
            case "bytes":
                if (to.body.type === "bytes") {
                    return;
                }
                break;
            case "streaming":
                if (to.body.type === "streaming") {
                    this.areStreamingResponsesCompatible({ from: from.body.value, to: to.body.value });
                    return;
                }
                break;
            case "streamParameter":
                if (to.body.type === "streamParameter") {
                    this.areStreamingResponsesCompatible({
                        from: from.body.streamResponse,
                        to: to.body.streamResponse
                    });
                    return;
                }
                break;
            default:
                assertNever(from.body);
        }
        this.errors.add(
            `HTTP response type "${from.body.type}" defined for endpoint "${id}" is not compatible with type "${to.body.type}".`
        );
    }

    private areJsonResponsesCompatible({ from, to }: { from: JsonResponse; to: JsonResponse }): boolean {
        return this.areTypeReferencesCompatible({ from: from.responseBodyType, to: to.responseBodyType });
    }

    private areStreamingResponsesCompatible({ from, to }: { from: StreamingResponse; to: StreamingResponse }): boolean {
        switch (from.type) {
            case "json":
                if (to.type === "json") {
                    return this.areTypeReferencesCompatible({ from: from.payload, to: to.payload });
                }
                break;
            case "sse":
                if (to.type === "sse") {
                    return this.areTypeReferencesCompatible({ from: from.payload, to: to.payload });
                }
                break;
            case "text":
                if (to.type === "text") {
                    return true;
                }
                break;
            default:
                assertNever(from);
        }
        this.errors.add(`Streaming response type "${from.type}" is not compatible with type "${to.type}".`);
        return false;
    }

    private areTypeDeclarationsCompatible({ from, to }: { from: TypeDeclaration; to: TypeDeclaration }): boolean {
        if (isMarkedUnstable(from.availability)) {
            return true;
        }
        return (
            this.areDeclaredTypeNamesCompatible({
                from: from.name,
                to: to.name
            }) &&
            this.areTypeShapesCompatible({
                from: from.shape,
                to: to.shape
            })
        );
    }

    private areTypeShapesCompatible({ from, to }: { from: Type; to: Type }): boolean {
        switch (from.type) {
            case "alias":
                if (to.type === "alias") {
                    return this.areAliasTypesCompatible({
                        from,
                        to
                    });
                }
                break;
            case "enum":
                if (to.type === "enum") {
                    return this.areEnumTypesCompatible({
                        from,
                        to
                    });
                }
                break;
            case "object":
                if (to.type === "object") {
                    return this.areObjectTypesCompatible({
                        from,
                        to
                    });
                }
                break;
            case "union":
                if (to.type === "union") {
                    return this.areUnionTypesCompatible({
                        from,
                        to
                    });
                }
                break;
            case "undiscriminatedUnion":
                if (to.type === "undiscriminatedUnion") {
                    return this.areUndiscriminatedUnionTypesCompatible({
                        from,
                        to
                    });
                }
                break;
            default:
                assertNever(from);
        }
        this.errors.add(`Type "${from.type}" is not compatible with type "${to.type}".`);
        return false;
    }

    private areAliasTypesCompatible({ from, to }: { from: Type.Alias; to: Type.Alias }): boolean {
        return this.areTypeReferencesCompatible({
            from: from.aliasOf,
            to: to.aliasOf
        });
    }

    private areEnumTypesCompatible({ from, to }: { from: Type.Enum; to: Type.Enum }): boolean {
        const fromValues = Object.fromEntries(from.values.map((value) => [value.name.wireValue, value]));
        const toValues = Object.fromEntries(to.values.map((value) => [value.name.wireValue, value]));
        if (Object.keys(fromValues).length !== Object.keys(toValues).length) {
            return false;
        }
        return Object.values(fromValues).every((value) => {
            const toValue = toValues[value.name.wireValue];
            if (!toValue) {
                this.errors.add(`Enum value "${value.name.wireValue}" was removed.`);
                return false;
            }
            return this.areNameAndWireValuesCompatible({
                from: value.name,
                to: toValue.name
            });
        });
    }

    private areObjectTypesCompatible({ from, to }: { from: Type.Object_; to: Type.Object_ }): boolean {
        const fromProperties = Object.fromEntries([
            ...from.properties.map((property) => [property.name.wireValue, property] as const),
            ...(from.extendedProperties?.map((property) => [property.name.wireValue, property] as const) ?? [])
        ]);
        const toProperties = Object.fromEntries([
            ...to.properties.map((property) => [property.name.wireValue, property] as const),
            ...(to.extendedProperties?.map((property) => [property.name.wireValue, property] as const) ?? [])
        ]);

        this.checkForNewRequiredTypeReferences({
            from: Object.fromEntries(
                Object.entries(fromProperties).map(([name, property]) => [name, property.valueType])
            ),
            to: Object.fromEntries(Object.entries(toProperties).map(([name, property]) => [name, property.valueType]))
        });

        return Object.values(fromProperties).every((property) => {
            const toProperty = toProperties[property.name.wireValue];
            if (!toProperty) {
                this.errors.add(`Object property "${property.name.wireValue}" was removed.`);
                return false;
            }
            return this.areObjectPropertiesCompatible({
                from: property,
                to: toProperty
            });
        });
    }

    private areObjectPropertiesCompatible({ from, to }: { from: ObjectProperty; to: ObjectProperty }): boolean {
        return (
            this.areNameAndWireValuesCompatible({
                from: from.name,
                to: to.name
            }) &&
            this.areTypeReferencesCompatible({
                from: from.valueType,
                to: to.valueType
            })
        );
    }

    private areUnionTypesCompatible({ from, to }: { from: Type.Union; to: Type.Union }): boolean {
        if (
            !this.areNameAndWireValuesCompatible({
                from: from.discriminant,
                to: to.discriminant
            })
        ) {
            this.errors.add(`Union type with discriminant value "${from.discriminant.wireValue}" changed.`);
            return false;
        }

        const fromExtendsKeys = new Set(from.extends.map((value) => this.getKeyForDeclaration(value)));
        const toExtendsKeys = new Set(to.extends.map((value) => this.getKeyForDeclaration(value)));
        for (const fromExtendsKey of fromExtendsKeys) {
            if (!toExtendsKeys.has(fromExtendsKey)) {
                this.errors.add(`Extended type "${fromExtendsKey}" was removed.`);
                return false;
            }
        }

        const fromProperties = Object.fromEntries(from.baseProperties.map((value) => [value.name.wireValue, value]));
        const toProperties = Object.fromEntries(to.baseProperties.map((value) => [value.name.wireValue, value]));
        for (const property of Object.values(fromProperties)) {
            const toProperty = toProperties[property.name.wireValue];
            if (!toProperty) {
                this.errors.add(
                    `Union type with discriminant value "${property.name.wireValue}" no longer has a property named "${property.name.wireValue}".`
                );
                return false;
            }
            if (
                !this.areObjectPropertiesCompatible({
                    from: property,
                    to: toProperty
                })
            ) {
                return false;
            }
        }

        this.checkForNewRequiredTypeReferences({
            from: Object.fromEntries(
                Object.entries(fromProperties).map(([name, property]) => [name, property.valueType])
            ),
            to: Object.fromEntries(Object.entries(toProperties).map(([name, property]) => [name, property.valueType]))
        });

        const fromTypes = Object.fromEntries(from.types.map((value) => [value.discriminantValue.wireValue, value]));
        const toTypes = Object.fromEntries(to.types.map((value) => [value.discriminantValue.wireValue, value]));
        return Object.values(fromTypes).every((value) => {
            const toValue = toTypes[value.discriminantValue.wireValue];
            if (!toValue) {
                this.errors.add(
                    `Union type for discriminant value "${value.discriminantValue.wireValue}" was removed.`
                );
                return false;
            }
            return this.areSingleUnionTypesCompatible({
                from: value.shape,
                to: toValue.shape
            });
        });
    }

    private areSingleUnionTypesCompatible({
        from,
        to
    }: {
        from: SingleUnionTypeProperties;
        to: SingleUnionTypeProperties;
    }): boolean {
        switch (from.propertiesType) {
            case "samePropertiesAsObject":
                if (to.propertiesType === "samePropertiesAsObject") {
                    return this.areDeclaredTypeNamesCompatible({
                        from,
                        to
                    });
                }
                break;
            case "singleProperty":
                if (to.propertiesType === "singleProperty") {
                    return (
                        this.areNameAndWireValuesCompatible({
                            from: from.name,
                            to: to.name
                        }) &&
                        this.areTypeReferencesCompatible({
                            from: from.type,
                            to: to.type
                        })
                    );
                }
                break;
            case "noProperties":
                if (to.propertiesType === "noProperties") {
                    return true;
                }
                break;
            default:
                assertNever(from);
        }
        this.errors.add(
            `Single union type of style "${from.propertiesType}" is not compatible with style "${to.propertiesType}".`
        );
        return false;
    }

    private areUndiscriminatedUnionTypesCompatible({
        from,
        to
    }: {
        from: Type.UndiscriminatedUnion;
        to: Type.UndiscriminatedUnion;
    }): boolean {
        // There isn't an easy way to uniquely identify each undiscriminated union member;
        // the best we can do is compare each member in the same order they're specified.
        //
        // This isn't perfect, so we'll need to restructure the IR to make this more reliable.
        return from.members.every((member, index) => {
            const toMember = to.members[index];
            if (!toMember) {
                this.errors.add(`Undiscriminated union member at index ${index} was removed.`);
                return false;
            }
            return this.areTypeReferencesCompatible({
                from: member.type,
                to: toMember.type
            });
        });
    }

    private checkForNewRequiredTypeReferences({
        from,
        to
    }: {
        from: Record<string, TypeReference>;
        to: Record<string, TypeReference>;
    }): void {
        for (const [propertyName, toProperty] of Object.entries(to)) {
            const fromProperty = from[propertyName];
            if (fromProperty) {
                continue;
            }
            if (toProperty.type !== "container" || toProperty.container.type !== "optional") {
                this.errors.add(`Required property "${propertyName}" was added.`);
            }
        }
    }

    private checkForNewFileUploadRequestProperties({
        from,
        to
    }: {
        from: IntermediateRepresentationChangeDetector.FileUploadRequest;
        to: IntermediateRepresentationChangeDetector.FileUploadRequest;
    }): void {
        for (const [propertyName, toProperty] of Object.entries(to)) {
            const fromProperty = from[propertyName];
            if (fromProperty) {
                continue;
            }
            if (toProperty === "file" || toProperty === "fileArray") {
                continue;
            }
            if (toProperty.type !== "container" || toProperty.container.type !== "optional") {
                this.errors.add(`Required property "${propertyName}" was added.`);
            }
        }
    }

    private checkForNewInlinedRequestBodyProperties({
        from,
        to
    }: {
        from: IntermediateRepresentationChangeDetector.InlinedRequestBody;
        to: IntermediateRepresentationChangeDetector.InlinedRequestBody;
    }): void {
        for (const [propertyName, toProperty] of Object.entries(to)) {
            const fromProperty = from[propertyName];
            if (fromProperty) {
                continue;
            }
            if (toProperty.type !== "container" || toProperty.container.type !== "optional") {
                this.errors.add(`Required property "${propertyName}" was added.`);
            }
        }
    }

    /**
     * The TypeReference checker is strict; even though it's wire compatible to change from a _required_ property
     * to an _optional_ property, it will still be detected as a breaking change due to language-specific code
     * generation (e.g. Java, Go, etc).
     */
    private areTypeReferencesCompatible({ from, to }: { from: TypeReference; to: TypeReference }): boolean {
        switch (from.type) {
            case "primitive":
                if (to.type === "primitive") {
                    return this.arePrimitiveTypesCompatible({
                        from,
                        to
                    });
                }
                break;
            case "container":
                if (to.type === "container") {
                    return this.areContainerTypesCompatible({
                        from: from.container,
                        to: to.container
                    });
                }
                break;
            case "named":
                if (to.type === "named") {
                    return this.areNamedTypesCompatible({
                        from,
                        to
                    });
                }
                break;
            case "unknown":
                if (to.type === "unknown") {
                    return true;
                }
                break;
            default:
                assertNever(from);
        }
        this.errors.add(`TypeReference "${from.type}" is not compatible with type "${to.type}".`);
        return false;
    }

    private arePrimitiveTypesCompatible({
        from,
        to
    }: {
        from: TypeReference.Primitive;
        to: TypeReference.Primitive;
    }): boolean {
        return from.primitive.v1 === to.primitive.v1;
    }

    private areContainerTypesCompatible({ from, to }: { from: ContainerType; to: ContainerType }): boolean {
        switch (from.type) {
            case "list":
                if (to.type === "list") {
                    return this.areTypeReferencesCompatible({
                        from: from.itemType,
                        to: to.itemType
                    });
                }
                break;
            case "set":
                if (to.type === "set") {
                    return this.areTypeReferencesCompatible({
                        from: from.set,
                        to: to.set
                    });
                }
                break;
            case "map":
                if (to.type === "map") {
                    return (
                        this.areTypeReferencesCompatible({
                            from: from.keyType,
                            to: to.keyType
                        }) &&
                        this.areTypeReferencesCompatible({
                            from: from.valueType,
                            to: to.valueType
                        })
                    );
                }
                break;
            case "optional":
                if (to.type === "optional") {
                    return this.areTypeReferencesCompatible({
                        from: from.optional,
                        to: to.optional
                    });
                }
                break;
            case "nullable":
                if (to.type === "nullable") {
                    return this.areTypeReferencesCompatible({
                        from: from.nullable,
                        to: to.nullable
                    });
                }
                break;
            case "literal":
                if (to.type === "literal") {
                    return this.areLiteralsCompatible({
                        from: from.literal,
                        to: to.literal
                    });
                }
                break;
            default:
                assertNever(from);
        }
        this.errors.add(`Container type "${from.type}" is not compatible with type "${to.type}".`);
        return false;
    }

    private areNamedTypesCompatible({ from, to }: { from: TypeReference.Named; to: TypeReference.Named }): boolean {
        return (
            this.areNamesCompatible({
                from: from.name,
                to: to.name
            }) &&
            this.areFernFilepathsCompatible({
                from: from.fernFilepath,
                to: to.fernFilepath
            })
        );
    }

    private areDeclaredTypeNamesCompatible({ from, to }: { from: DeclaredTypeName; to: DeclaredTypeName }): boolean {
        return (
            this.areNamesCompatible({
                from: from.name,
                to: to.name
            }) &&
            this.areFernFilepathsCompatible({
                from: from.fernFilepath,
                to: to.fernFilepath
            })
        );
    }

    private areDeclaredErrorNamesCompatible({ from, to }: { from: DeclaredErrorName; to: DeclaredErrorName }): boolean {
        return (
            this.areNamesCompatible({
                from: from.name,
                to: to.name
            }) &&
            this.areFernFilepathsCompatible({
                from: from.fernFilepath,
                to: to.fernFilepath
            })
        );
    }

    private areNameAndWireValuesCompatible({ from, to }: { from: NameAndWireValue; to: NameAndWireValue }): boolean {
        return (
            this.areNamesCompatible({
                from: from.name,
                to: to.name
            }) && from.wireValue === to.wireValue
        );
    }

    private areLiteralsCompatible({ from, to }: { from: Literal; to: Literal }): boolean {
        switch (from.type) {
            case "boolean":
                if (to.type === "boolean") {
                    return from.boolean === to.boolean;
                }
                break;
            case "string":
                if (to.type === "string") {
                    return from.string === to.string;
                }
                break;
            default:
                assertNever(from);
        }
        return false;
    }

    private areFernFilepathsCompatible({ from, to }: { from: FernFilepath; to: FernFilepath }): boolean {
        if (from.allParts.length !== to.allParts.length) {
            return false;
        }
        return from.allParts.every((part, index) => {
            const toPart = to.allParts[index];
            if (toPart == null) {
                return false;
            }
            return this.areNamesCompatible({
                from: part,
                to: toPart
            });
        });
    }

    private areNamesCompatible({ from, to }: { from: Name; to: Name }): boolean {
        return from.originalName === to.originalName;
    }

    private getInlinedRequestBody(
        inlinedRequestBody: InlinedRequestBody
    ): IntermediateRepresentationChangeDetector.InlinedRequestBody {
        const requestBody: IntermediateRepresentationChangeDetector.InlinedRequestBody = {};
        for (const property of [...(inlinedRequestBody.extendedProperties ?? []), ...inlinedRequestBody.properties]) {
            requestBody[property.name.wireValue] = property.valueType;
        }
        return requestBody;
    }

    private getFileUploadRequest(
        fileUploadRequestProperties: FileUploadRequestProperty[]
    ): IntermediateRepresentationChangeDetector.FileUploadRequest {
        const properties: IntermediateRepresentationChangeDetector.FileUploadRequest = {};
        for (const property of fileUploadRequestProperties) {
            switch (property.type) {
                case "file":
                    properties[property.value.key.wireValue] = "file";
                    break;
                case "bodyProperty":
                    properties[property.name.wireValue] = property.valueType;
                    break;
                default:
                    assertNever(property);
            }
        }
        return properties;
    }

    private getKeyForDeclaration({ name, fernFilepath }: { name: Name; fernFilepath: FernFilepath }): string {
        const prefix = fernFilepath.allParts.map((part) => part.camelCase.unsafeName).join(".");
        return `${prefix}.${name.pascalCase.unsafeName}`;
    }
}
