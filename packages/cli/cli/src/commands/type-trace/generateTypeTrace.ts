import { Logger } from "@fern-api/logger";
import { ServiceId, TypeId } from "@fern-fern/ir-model/commons";
import { FileUploadRequestProperty, HttpEndpoint, HttpRequestBody, HttpResponse, HttpService } from "@fern-fern/ir-model/http";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { ContainerType, DeclaredTypeName, TypeReference } from "@fern-fern/ir-model/types";
import { uniq, uniqBy } from "lodash-es";


interface TypeTraceResult {
    requestSideServiceIds: ServiceId[];
    responseSideServiceIds: ServiceId[];
}
type MutableTypeTrace = Record<TypeId, TypeTraceResult>;
export type TypeTrace = Readonly<MutableTypeTrace>;

export function generateTypeTrace(intermediateRepresentation: IntermediateRepresentation, logger: Logger): TypeTrace {
    const typeTrace: MutableTypeTrace = {};
    Object.entries(intermediateRepresentation.services).forEach(([serviceId, service]) => {
        visitService(service, serviceId, typeTrace, logger);
        service.endpoints.forEach(endpoint => {
            visitEndpoint(endpoint, serviceId, typeTrace, logger);
        });
    });

    const visitedTypeIds = new Set<TypeId>();
    Object.keys(typeTrace).forEach(typeId => {
        if (!visitedTypeIds.has(typeId)) {
            const typeResult = typeTrace[typeId];
            const typeDeclaration = intermediateRepresentation.types[typeId];
            if (typeResult != null && typeDeclaration != null) {
                typeDeclaration.referencedTypes.forEach(referencedType => {
                    typeResult.requestSideServiceIds.forEach(serviceId => addToTypeTrace(typeTrace, referencedType.typeId, serviceId, "request"));
                    typeResult.responseSideServiceIds.forEach(serviceId => addToTypeTrace(typeTrace, referencedType.typeId, serviceId, "response"));
                });
            }
            visitedTypeIds.add(typeId);
        }
    });

    Object.keys(typeTrace).forEach(typeId => {
        typeTrace[typeId] = {
            requestSideServiceIds: uniq(typeTrace[typeId]?.requestSideServiceIds ?? []),
            responseSideServiceIds: uniq(typeTrace[typeId]?.responseSideServiceIds ?? []),
        };
    });

    return typeTrace;
}

function visitService(service: HttpService, serviceId: ServiceId, typeTrace: MutableTypeTrace, logger: Logger) {
    dedupeTypeNames(service.pathParameters.flatMap(pathParameter => visitTypeReference(pathParameter.valueType))).forEach(typeName => {
        logger.info(typeName.typeId, serviceId);
        addToTypeTrace(typeTrace, typeName.typeId, serviceId, "request");
    });
}

function visitEndpoint(endpoint: HttpEndpoint, serviceId: ServiceId, typeTrace: MutableTypeTrace, logger: Logger) {
    // request-side
    const pathParameterTypeNames = dedupeTypeNames(endpoint.pathParameters.flatMap(pathParameter => visitTypeReference(pathParameter.valueType)));
    const queryParameterTypeNames = dedupeTypeNames(endpoint.queryParameters.flatMap(queryParameter => visitTypeReference(queryParameter.valueType)));
    const bodyTypeNames = endpoint.requestBody != null ? dedupeTypeNames(HttpRequestBody._visit(endpoint.requestBody, bodyVisitor)) : [];

    [...pathParameterTypeNames, ...queryParameterTypeNames, ...bodyTypeNames].forEach(typeName => {
        logger.info(typeName.typeId, serviceId);
        addToTypeTrace(typeTrace, typeName.typeId, serviceId, "request");
    });

    // response-side
    const responseTypeNames = endpoint.response != null ? HttpResponse._visit(endpoint.response, responseVisitor) : [];
    const streamingResponseTypeNames = endpoint.streamingResponse != null ? TypeReference._visit(endpoint.streamingResponse.dataEventType, typeReferenceVisitor) : [];

    [...responseTypeNames, ...streamingResponseTypeNames].forEach(typeName => {
        logger.info(typeName.typeId, serviceId);
        addToTypeTrace(typeTrace, typeName.typeId, serviceId, "response");
    });
}

function addToTypeTrace(typeTrace: MutableTypeTrace, typeId: TypeId, serviceId: ServiceId, side: "request" | "response") {
    if (typeTrace[typeId] == null) {
        typeTrace[typeId] = { requestSideServiceIds: [], responseSideServiceIds: [] };
    }
    const typeResult = typeTrace[typeId];

    if (side === "request") {
        typeResult?.requestSideServiceIds.push(serviceId);
    } else {
        typeResult?.responseSideServiceIds.push(serviceId);
    }
}

function visitTypeReference(typeReference: TypeReference) {
    return TypeReference._visit(typeReference, typeReferenceVisitor);
}

function dedupeTypeNames(typeNames: DeclaredTypeName[]) {
    return uniqBy(typeNames, "typeId");
}

const typeReferenceVisitor: TypeReference._Visitor<DeclaredTypeName[]> = {
    named: named => [named],
    container: container => ContainerType._visit(container, containerTypeReferenceVisitor),
    primitive: () => [],
    unknown: () => [],
    _unknown: () => [],
};

const containerTypeReferenceVisitor: ContainerType._Visitor<DeclaredTypeName[]> = {
    list: list => TypeReference._visit(list, typeReferenceVisitor),
    map: map => {
        const keyTypeNames = TypeReference._visit(map.keyType, typeReferenceVisitor);
        const valueTypeNames = TypeReference._visit(map.valueType, typeReferenceVisitor);
        return [...keyTypeNames, ...valueTypeNames];
    },
    optional: optional => TypeReference._visit(optional, typeReferenceVisitor),
    set: set => TypeReference._visit(set, typeReferenceVisitor),
    literal: () => [],
    _unknown: () => [],
};

const fileUploadPropertyVisitor: FileUploadRequestProperty._Visitor<DeclaredTypeName[]> = {
    bodyProperty: bodyProperty => TypeReference._visit(bodyProperty.valueType, typeReferenceVisitor),
    file: () => [],
    _unknown: () => [],
};

const bodyVisitor: HttpRequestBody._Visitor<DeclaredTypeName[]> = {
    inlinedRequestBody: inlinedRequestBody => [...inlinedRequestBody.extends, ...inlinedRequestBody.properties.flatMap(property => TypeReference._visit(property.valueType, typeReferenceVisitor))],
    reference: reference => TypeReference._visit(reference.requestBodyType, typeReferenceVisitor),
    fileUpload: fileUpload => fileUpload.properties.flatMap(property => FileUploadRequestProperty._visit(property, fileUploadPropertyVisitor)),
    _unknown: () => [],
};

const responseVisitor: HttpResponse._Visitor<DeclaredTypeName[]> = {
    json: json => TypeReference._visit(json.responseBodyType, typeReferenceVisitor),
    fileDownload: () => [],
    _unknown: () => [],
};