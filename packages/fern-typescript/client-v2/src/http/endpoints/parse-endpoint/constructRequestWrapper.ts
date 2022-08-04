import { TypeReference } from "@fern-fern/ir-model";
import {
    HttpEndpoint,
    HttpHeader,
    HttpRequest,
    HttpService,
    PathParameter,
    QueryParameter,
} from "@fern-fern/ir-model/services";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { File } from "@fern-typescript/declaration-handler";
import { InterfaceDeclaration, ModuleDeclaration, ts } from "ts-morph";
import { getReferenceToMaybeVoidType } from "./getReferenceToMaybeVoidType";

export interface RequestWrapper {
    referenceToWrapper: ts.TypeNode;
    pathParameters: WrapperField<PathParameter>[];
    queryParameters: WrapperField<QueryParameter>[];
    headers: WrapperField<HttpHeader>[];
    body: WrapperField<HttpRequest> | undefined;
}

export interface WrapperField<T> {
    key: string;
    type: ts.TypeNode;
    originalData: T;
}

export function constructRequestWrapper({
    service,
    endpoint,
    file,
    endpointModule,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    file: File;
    endpointModule: ModuleDeclaration;
}): RequestWrapper {
    const wrapperInterface = endpointModule.addInterface({
        name: "Request",
        isExported: true,
    });

    const referenceToWrapper = ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(
            ts.factory.createQualifiedName(
                file.getReferenceToService(service.name).entityName,
                ts.factory.createIdentifier(endpointModule.getName())
            ),
            wrapperInterface.getName()
        )
    );

    const pathParameters = constructWrapperFields({
        items: endpoint.pathParameters,
        file,
        wrapperInterface,
        getInfo: (pathParameter) => ({
            key: pathParameter.key,
            typeReference: pathParameter.valueType,
            docs: pathParameter.docs,
        }),
    });

    const queryParameters = constructWrapperFields({
        items: endpoint.queryParameters,
        file,
        wrapperInterface,
        getInfo: (queryParameter) => ({
            key: queryParameter.key,
            typeReference: queryParameter.valueType,
            docs: queryParameter.docs,
        }),
    });

    const headers = constructWrapperFields({
        items: [...endpoint.headers],
        file,
        wrapperInterface,
        getInfo: (header) => ({
            key: header.header,
            typeReference: header.valueType,
            docs: header.docs,
        }),
    });

    const body = constructBody({ request: endpoint.request, file, wrapperInterface });

    return {
        referenceToWrapper,
        pathParameters,
        queryParameters,
        headers,
        body,
    };
}

function constructWrapperFields<T>({
    items,
    file,
    wrapperInterface,
    getInfo,
}: {
    items: T[];
    file: File;
    wrapperInterface: InterfaceDeclaration;
    getInfo: (item: T) => { key: string; typeReference: TypeReference; docs: string | null | undefined };
}): WrapperField<T>[] {
    return items.map((item) => {
        const { key, typeReference, docs } = getInfo(item);
        const type = file.getReferenceToType(typeReference);

        const property = wrapperInterface.addProperty({
            name: key,
            type: getTextOfTsNode(type),
        });
        maybeAddDocs(property, docs);

        return {
            key,
            type,
            originalData: item,
        };
    });
}

function constructBody({
    request,
    file,
    wrapperInterface,
}: {
    request: HttpRequest;
    file: File;
    wrapperInterface: InterfaceDeclaration;
}): WrapperField<HttpRequest> | undefined {
    const bodyType = getReferenceToMaybeVoidType(request.type, file);
    if (bodyType == null) {
        return undefined;
    }

    const property = wrapperInterface.addProperty({
        name: "body",
        type: getTextOfTsNode(bodyType),
    });

    return {
        key: property.getName(),
        type: bodyType,
        originalData: request,
    };
}
