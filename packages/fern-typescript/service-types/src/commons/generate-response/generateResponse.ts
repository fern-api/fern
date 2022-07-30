import { FernConstants } from "@fern-fern/ir-model";
import { ResponseErrors } from "@fern-fern/ir-model/services";
import { DependencyManager, getTextOfTsNode } from "@fern-typescript/commons";
import { InlinedServiceTypeReference, ModelContext, ServiceTypeReference } from "@fern-typescript/model-context";
import { ModelServiceTypeReference } from "@fern-typescript/model-context/src/service-type-context/types";
import {
    ModuleDeclaration,
    Node,
    OptionalKind,
    PropertySignatureStructure,
    SourceFile,
    StatementedNode,
    ts,
    Writers,
} from "ts-morph";
import { ServiceTypesConstants } from "../../constants";
import { ServiceTypeFileWriter } from "../service-type-reference/generateServiceTypeReference";
import { generateErrorBody } from "./generateErrorBody";

export declare namespace generateResponse {
    export interface Args<M> {
        modelContext: ModelContext;
        writeServiceTypeFile: ServiceTypeFileWriter<M>;
        dependencyManager: DependencyManager;
        successBodyReference: ModelServiceTypeReference | undefined;
        responseErrors: ResponseErrors;
        getTypeReferenceToServiceType: (args: {
            reference: ServiceTypeReference<M>;
            referencedIn: SourceFile;
        }) => ts.TypeNode;
        additionalProperties?: OptionalKind<PropertySignatureStructure>[];
        fernConstants: FernConstants;
    }

    export interface Return<M> {
        reference: InlinedServiceTypeReference<M>;
        errorBodyReference: InlinedServiceTypeReference<M>;
    }
}

export function generateResponse<M>({
    modelContext,
    writeServiceTypeFile,
    dependencyManager,
    successBodyReference,
    responseErrors,
    getTypeReferenceToServiceType,
    additionalProperties = [],
    fernConstants,
}: generateResponse.Args<M>): generateResponse.Return<M> {
    const { errorBodyReference } = maybeGenerateErrorBody({
        modelContext,
        responseErrors,
        dependencyManager,
        writeServiceTypeFile,
        fernConstants,
    });

    const responseMetadata = writeServiceTypeFile(
        ServiceTypesConstants.Commons.Response.TYPE_NAME,
        (responseFile, transformedTypeName) => {
            responseFile.addTypeAlias({
                name: transformedTypeName,
                type: Writers.unionType(
                    getTextOfTsNode(
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createQualifiedName(
                                ts.factory.createIdentifier(transformedTypeName),
                                ts.factory.createIdentifier(ServiceTypesConstants.Commons.Response.Success.TYPE_NAME)
                            ),
                            undefined
                        )
                    ),
                    getTextOfTsNode(
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createQualifiedName(
                                ts.factory.createIdentifier(transformedTypeName),
                                ts.factory.createIdentifier(ServiceTypesConstants.Commons.Response.Error.TYPE_NAME)
                            ),
                            undefined
                        )
                    )
                ),
                isExported: true,
            });

            const responseNamespace = responseFile.addModule({
                name: transformedTypeName,
                isExported: true,
                hasDeclareKeyword: true,
            });

            addSuccessResponseInterface({
                module: responseNamespace,
                successBodyReference,
                getTypeReferenceToServiceType,
                additionalProperties,
            });

            addErrorResponseInterface({
                responseNamespace,
                additionalProperties,
                getTypeReferenceToServiceType,
                errorBodyReference,
            });
        }
    );

    return {
        reference: {
            isInlined: true,
            metadata: responseMetadata,
        },
        errorBodyReference,
    };
}

export function addSuccessResponseInterface<M>({
    successBodyReference,
    getTypeReferenceToServiceType,
    module,
    additionalProperties,
}: {
    successBodyReference: ServiceTypeReference<M> | undefined;
    getTypeReferenceToServiceType: (args: {
        reference: ServiceTypeReference<M>;
        referencedIn: SourceFile;
    }) => ts.TypeNode;
    module: Node & StatementedNode;
    additionalProperties: OptionalKind<PropertySignatureStructure>[];
}): void {
    const successResponseBodyReference =
        successBodyReference != null
            ? getTypeReferenceToServiceType({
                  reference: successBodyReference,
                  referencedIn: module.getSourceFile(),
              })
            : undefined;

    module.addInterface({
        name: ServiceTypesConstants.Commons.Response.Success.TYPE_NAME,
        isExported: true,
        properties: generateSuccessResponseProperties({
            successResponseBodyReference,
            additionalProperties,
        }),
    });
}

function generateSuccessResponseProperties({
    successResponseBodyReference,
    additionalProperties,
}: {
    successResponseBodyReference: ts.TypeNode | undefined;
    additionalProperties: OptionalKind<PropertySignatureStructure>[];
}): OptionalKind<PropertySignatureStructure>[] {
    const properties = [...createBaseResponseProperties({ ok: true }), ...additionalProperties];

    if (successResponseBodyReference != null) {
        properties.push({
            name: ServiceTypesConstants.Commons.Response.Success.Properties.Body.PROPERTY_NAME,
            type: getTextOfTsNode(successResponseBodyReference),
        });
    }

    return properties;
}

function addErrorResponseInterface<M>({
    responseNamespace,
    additionalProperties,
    getTypeReferenceToServiceType,
    errorBodyReference,
}: {
    responseNamespace: ModuleDeclaration;
    additionalProperties: OptionalKind<PropertySignatureStructure>[];
    getTypeReferenceToServiceType: (args: {
        reference: ServiceTypeReference<M>;
        referencedIn: SourceFile;
    }) => ts.TypeNode;
    errorBodyReference: ServiceTypeReference<M>;
}) {
    const properties: OptionalKind<PropertySignatureStructure>[] = [
        ...createBaseResponseProperties({ ok: false }),
        ...additionalProperties,
    ];

    properties.push({
        name: ServiceTypesConstants.Commons.Response.Error.Properties.Body.PROPERTY_NAME,
        type: getTextOfTsNode(
            getTypeReferenceToServiceType({
                reference: errorBodyReference,
                referencedIn: responseNamespace.getSourceFile(),
            })
        ),
    });

    responseNamespace.addInterface({
        name: ServiceTypesConstants.Commons.Response.Error.TYPE_NAME,
        isExported: true,
        properties,
    });
}

function createBaseResponseProperties({ ok }: { ok: boolean }): OptionalKind<PropertySignatureStructure>[] {
    return [
        {
            name: ServiceTypesConstants.Commons.Response.Properties.OK,
            type: getTextOfTsNode(
                ts.factory.createLiteralTypeNode(ok ? ts.factory.createTrue() : ts.factory.createFalse())
            ),
        },
    ];
}

function maybeGenerateErrorBody<M>({
    modelContext,
    responseErrors,
    dependencyManager,
    writeServiceTypeFile,
    fernConstants,
}: {
    modelContext: ModelContext;
    responseErrors: ResponseErrors;
    dependencyManager: DependencyManager;
    writeServiceTypeFile: ServiceTypeFileWriter<M>;
    fernConstants: FernConstants;
}): { errorBodyReference: InlinedServiceTypeReference<M> } {
    const errorBodyMetadata = writeServiceTypeFile(
        ServiceTypesConstants.Commons.Response.Error.Properties.Body.TYPE_NAME,
        (errorBodyFile, transformedTypeName) => {
            generateErrorBody({
                responseErrors,
                errorBodyFile,
                errorBodyTypeName: transformedTypeName,
                modelContext,
                dependencyManager,
                fernConstants,
            });
        }
    );

    return {
        errorBodyReference: {
            isInlined: true,
            metadata: errorBodyMetadata,
        },
    };
}
