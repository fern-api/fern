import {
    HttpEndpoint,
    HttpHeader,
    HttpRequest,
    PathParameter,
    QueryParameter,
} from "@fern-fern/ir-model/services/http";
import { TypeReference } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
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
    type: TypeReferenceNode;
    originalData: T;
}

export function constructRequestWrapper({
    endpoint,
    file,
    endpointModule,
}: {
    endpoint: HttpEndpoint;
    file: SdkFile;
    endpointModule: ModuleDeclaration;
}): RequestWrapper {
    const wrapperInterface = endpointModule.addInterface({
        name: "Request",
        isExported: true,
    });

    const referenceToWrapper = ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(
            file.getReferenceToExportInSameFile(endpointModule.getName()).entityName,
            wrapperInterface.getName()
        )
    );

    const pathParameters = constructWrapperFields({
        items: endpoint.pathParameters,
        file,
        wrapperInterface,
        getInfo: (pathParameter) => ({
            key: pathParameter.name.camelCase,
            typeReference: pathParameter.valueType,
            docs: pathParameter.docs,
        }),
    });

    const queryParameters = constructWrapperFields({
        items: endpoint.queryParameters,
        file,
        wrapperInterface,
        getInfo: (queryParameter) => ({
            key: queryParameter.name.camelCase,
            typeReference: queryParameter.valueType,
            docs: queryParameter.docs,
        }),
    });

    const headers = constructWrapperFields({
        items: [...endpoint.headers],
        file,
        wrapperInterface,
        getInfo: (header) => ({
            key: header.name.camelCase,
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
    file: SdkFile;
    wrapperInterface: InterfaceDeclaration;
    getInfo: (item: T) => { key: string; typeReference: TypeReference; docs: string | null | undefined };
}): WrapperField<T>[] {
    return items.map((item) => {
        const { key, typeReference, docs } = getInfo(item);
        const type = file.getReferenceToType(typeReference);

        const property = wrapperInterface.addProperty({
            name: key,
            type: getTextOfTsNode(type.isOptional ? type.typeNodeWithoutUndefined : type.typeNode),
            hasQuestionToken: type.isOptional,
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
    file: SdkFile;
    wrapperInterface: InterfaceDeclaration;
}): WrapperField<HttpRequest> | undefined {
    const bodyType = getReferenceToMaybeVoidType(request.type, file);
    if (bodyType == null) {
        return undefined;
    }

    const property = wrapperInterface.addProperty({
        name: "body",
        type: getTextOfTsNode(bodyType.isOptional ? bodyType.typeNodeWithoutUndefined : bodyType.typeNode),
        hasQuestionToken: bodyType.isOptional,
    });

    return {
        key: property.getName(),
        type: bodyType,
        originalData: request,
    };
}
