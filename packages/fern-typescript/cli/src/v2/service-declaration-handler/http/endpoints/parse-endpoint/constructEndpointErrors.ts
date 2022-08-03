import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services";
import { getWriterForMultiLineUnionType, visitorUtils } from "@fern-typescript/commons";
import {
    generateVisitMethod,
    generateVisitorInterface,
    VisitableItem,
} from "@fern-typescript/commons/src/utils/visitorUtils";
import { ModuleDeclaration, ts, TypeAliasDeclaration } from "ts-morph";
import { File } from "../../../../client/types";
import { getGeneratedTypeName } from "../../../../client/utils/getGeneratedTypeName";

export function constructEndpointErrors({
    service,
    endpoint,
    file,
    endpointModule,
    endpointUtils,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    file: File;
    endpointModule: ModuleDeclaration;
    endpointUtils: ts.ObjectLiteralElementLike[];
}): ts.TypeNode {
    const errorTypeAlias = endpointModule.addTypeAlias({
        name: "Error",
        isExported: true,
        type: getWriterForMultiLineUnionType([
            ...endpoint.errors.map((error) => ({
                node: file.getReferenceToError(error.error),
                docs: error.docs,
            })),
            {
                docs: undefined,
                node: file.externalDependencies.serviceUtils.NetworkError._getReferenceToType(),
            },
            {
                docs: undefined,
                node: file.externalDependencies.serviceUtils.UnknownError._getReferenceToType(),
            },
        ]),
    });

    const referenceToErrorType = ts.factory.createQualifiedName(
        ts.factory.createQualifiedName(
            file.getReferenceToService(service.name).entityName,
            ts.factory.createIdentifier(endpointModule.getName())
        ),
        errorTypeAlias.getName()
    );

    addVisit({ endpoint, file, endpointModule, errorTypeAlias, endpointUtils, service });

    return ts.factory.createTypeReferenceNode(referenceToErrorType);
}
function addVisit({
    endpoint,
    file,
    endpointModule,
    errorTypeAlias,
    endpointUtils,
    service,
}: {
    endpoint: HttpEndpoint;
    file: File;
    endpointModule: ModuleDeclaration;
    errorTypeAlias: TypeAliasDeclaration;
    endpointUtils: ts.ObjectLiteralElementLike[];
    service: HttpService;
}) {
    const visitableItems: VisitableItem[] = [
        ...endpoint.errors.map((error) => ({
            caseInSwitchStatement: ts.factory.createStringLiteral(error.discriminantValue),
            keyInVisitor: getGeneratedTypeName(error.error),
            visitorArgument: {
                argument: ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                type: file.getReferenceToError(error.error),
            },
        })),
        {
            caseInSwitchStatement: ts.factory.createStringLiteral(
                file.externalDependencies.serviceUtils.NetworkError.ERROR_NAME
            ),
            keyInVisitor: file.externalDependencies.serviceUtils.NetworkError.ERROR_NAME,
            visitorArgument: undefined,
        },
    ];

    endpointModule
        .addModule({
            name: errorTypeAlias.getName(),
            isExported: true,
        })
        .addInterface(generateVisitorInterface(visitableItems));

    endpointUtils.push(
        ts.factory.createPropertyAssignment(
            errorTypeAlias.getName(),
            ts.factory.createObjectLiteralExpression([
                ts.factory.createPropertyAssignment(
                    visitorUtils.VISIT_PROPERTY_NAME,
                    generateVisitMethod({
                        typeName: ts.factory.createQualifiedName(
                            ts.factory.createQualifiedName(
                                file.getReferenceToService(service.name).entityName,
                                ts.factory.createIdentifier(endpointModule.getName())
                            ),
                            errorTypeAlias.getName()
                        ),
                        switchOn: ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                            file.fernConstants.errorDiscriminant
                        ),
                        items: visitableItems,
                    })
                ),
            ])
        )
    );
}
