import { CasingsGenerator, constructCasingsGenerator } from "@fern-api/casings-generator";
import { GeneratorName } from "@fern-api/configuration-loader";
import { IrMigrationContext } from "../../IrMigrationContext.js";
import { IrSerialization } from "../../ir-serialization/index.js";
import { IrVersions } from "../../ir-versions/index.js";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration.js";

export const V66_TO_V65_MIGRATION: IrMigration<
    IrVersions.V65.ir.IntermediateRepresentation,
    IrVersions.V65.ir.IntermediateRepresentation
> = {
    laterVersion: "v66",
    earlierVersion: "v65",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V64.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "passthrough",
            skipValidation: true
        }),
    migrateBackwards: (
        v66: IrVersions.V65.ir.IntermediateRepresentation,
        context: IrMigrationContext
    ): IrVersions.V65.ir.IntermediateRepresentation => {
        const casingsGenerator =
            context.casingsGenerator ??
            constructCasingsGenerator({
                generationLanguage: undefined,
                keywords: undefined,
                smartCasing: false
            });
        return inflateIr(v66, casingsGenerator);
    }
};

/**
 * Inflates all NameOrString values back to full Name objects,
 * and all NameAndWireValueOrString values back to full NameAndWireValue objects.
 * Recursively traverses all example structures to ensure no string-form names remain.
 */
function inflateIr(
    ir: IrVersions.V65.ir.IntermediateRepresentation,
    casingsGenerator: CasingsGenerator
): IrVersions.V65.ir.IntermediateRepresentation {
    // ===== Core inflate helpers =====

    const inflateName = (name: IrVersions.V65.NameOrString): IrVersions.V65.Name => {
        if (typeof name === "string") {
            return casingsGenerator.generateName(name);
        }
        return name;
    };

    const inflateOptionalName = (name: IrVersions.V65.NameOrString | undefined): IrVersions.V65.Name | undefined => {
        if (name == null) {
            return undefined;
        }
        return inflateName(name);
    };

    const inflateNameAndWireValue = (
        nameAndWireValue: IrVersions.V65.NameAndWireValueOrString
    ): IrVersions.V65.NameAndWireValue => {
        if (typeof nameAndWireValue === "string") {
            return casingsGenerator.generateNameAndWireValue({
                wireValue: nameAndWireValue,
                name: nameAndWireValue
            });
        }
        return {
            ...nameAndWireValue,
            name: inflateName(nameAndWireValue.name)
        };
    };

    // ===== Structural inflate helpers =====

    const inflateFernFilepath = (fp: IrVersions.V65.FernFilepath): IrVersions.V65.FernFilepath => ({
        allParts: fp.allParts.map(inflateName),
        packagePath: fp.packagePath.map(inflateName),
        file: fp.file != null ? inflateName(fp.file) : undefined
    });

    const inflateDeclaredTypeName = (dtn: IrVersions.V65.DeclaredTypeName): IrVersions.V65.DeclaredTypeName => ({
        ...dtn,
        fernFilepath: inflateFernFilepath(dtn.fernFilepath),
        name: inflateName(dtn.name)
    });

    const inflateObjectProperty = (prop: IrVersions.V65.ObjectProperty): IrVersions.V65.ObjectProperty => ({
        ...prop,
        name: inflateNameAndWireValue(prop.name)
    });

    const inflatePropertyPathItem = (item: IrVersions.V65.PropertyPathItem): IrVersions.V65.PropertyPathItem => ({
        ...item,
        name: inflateName(item.name)
    });

    // ===== Type declaration inflate =====

    const inflateTypeDeclaration = (td: IrVersions.V65.TypeDeclaration): IrVersions.V65.TypeDeclaration => ({
        ...td,
        name: inflateDeclaredTypeName(td.name),
        shape: inflateTypeShape(td.shape),
        autogeneratedExamples: td.autogeneratedExamples.map(inflateExampleType),
        userProvidedExamples: td.userProvidedExamples.map(inflateExampleType)
    });

    const inflateTypeShape = (shape: IrVersions.V65.Type): IrVersions.V65.Type => {
        switch (shape.type) {
            case "object":
                return IrVersions.V65.Type.object({
                    ...shape,
                    properties: shape.properties.map(inflateObjectProperty),
                    extendedProperties:
                        shape.extendedProperties != null
                            ? shape.extendedProperties.map(inflateObjectProperty)
                            : undefined,
                    extends: shape.extends.map(inflateDeclaredTypeName)
                });
            case "union":
                return IrVersions.V65.Type.union({
                    ...shape,
                    discriminant: inflateNameAndWireValue(shape.discriminant),
                    extends: shape.extends.map(inflateDeclaredTypeName),
                    baseProperties: shape.baseProperties.map(inflateObjectProperty),
                    types: shape.types.map((ut) => ({
                        ...ut,
                        discriminantValue: inflateNameAndWireValue(ut.discriminantValue),
                        shape: inflateSingleUnionTypeProperties(ut.shape)
                    }))
                });
            case "enum":
                return IrVersions.V65.Type.enum({
                    ...shape,
                    values: shape.values.map((v) => ({
                        ...v,
                        name: inflateNameAndWireValue(v.name)
                    }))
                });
            case "alias":
            case "undiscriminatedUnion":
                return shape;
            default:
                return shape;
        }
    };

    const inflateSingleUnionTypeProperties = (
        props: IrVersions.V65.SingleUnionTypeProperties
    ): IrVersions.V65.SingleUnionTypeProperties => {
        switch (props.propertiesType) {
            case "singleProperty":
                return {
                    ...props,
                    name: inflateNameAndWireValue(props.name)
                } as IrVersions.V65.SingleUnionTypeProperties;
            default:
                return props;
        }
    };

    // ===== Example type inflate (recursive) =====

    const inflateExampleType = (ex: IrVersions.V65.ExampleType): IrVersions.V65.ExampleType => ({
        ...ex,
        name: inflateOptionalName(ex.name),
        shape: inflateExampleTypeShape(ex.shape)
    });

    const inflateExampleTypeReference = (
        ref: IrVersions.V65.ExampleTypeReference
    ): IrVersions.V65.ExampleTypeReference => ({
        ...ref,
        shape: inflateExampleTypeReferenceShape(ref.shape)
    });

    const inflateExampleTypeReferenceShape = (
        shape: IrVersions.V65.ExampleTypeReferenceShape
    ): IrVersions.V65.ExampleTypeReferenceShape => {
        switch (shape.type) {
            case "named":
                return IrVersions.V65.ExampleTypeReferenceShape.named({
                    ...shape,
                    typeName: inflateDeclaredTypeName(shape.typeName),
                    shape: inflateExampleTypeShape(shape.shape)
                });
            case "container":
                return IrVersions.V65.ExampleTypeReferenceShape.container(inflateExampleContainer(shape));
            case "primitive":
            case "unknown":
                return shape;
            default:
                return shape;
        }
    };

    const inflateExampleContainer = (container: IrVersions.V65.ExampleContainer): IrVersions.V65.ExampleContainer => {
        switch (container.type) {
            case "list":
                return IrVersions.V65.ExampleContainer.list({
                    ...container,
                    list: container.list.map(inflateExampleTypeReference)
                });
            case "set":
                return IrVersions.V65.ExampleContainer.set({
                    ...container,
                    set: container.set.map(inflateExampleTypeReference)
                });
            case "optional":
                return IrVersions.V65.ExampleContainer.optional({
                    ...container,
                    optional: container.optional != null ? inflateExampleTypeReference(container.optional) : undefined
                });
            case "nullable":
                return IrVersions.V65.ExampleContainer.nullable({
                    ...container,
                    nullable: container.nullable != null ? inflateExampleTypeReference(container.nullable) : undefined
                });
            case "map":
                return IrVersions.V65.ExampleContainer.map({
                    ...container,
                    map: container.map.map((kvp) => ({
                        ...kvp,
                        key: inflateExampleTypeReference(kvp.key),
                        value: inflateExampleTypeReference(kvp.value)
                    }))
                });
            case "literal":
                return container;
            default:
                return container;
        }
    };

    const inflateExampleTypeShape = (shape: IrVersions.V65.ExampleTypeShape): IrVersions.V65.ExampleTypeShape => {
        switch (shape.type) {
            case "object":
                return IrVersions.V65.ExampleTypeShape.object({
                    ...shape,
                    properties: shape.properties.map(inflateExampleObjectProperty),
                    extraProperties:
                        shape.extraProperties != null
                            ? shape.extraProperties.map(inflateExampleExtraObjectProperty)
                            : undefined
                });
            case "union":
                return IrVersions.V65.ExampleTypeShape.union({
                    ...shape,
                    discriminant: inflateNameAndWireValue(shape.discriminant),
                    singleUnionType: inflateExampleSingleUnionType(shape.singleUnionType),
                    extendProperties:
                        shape.extendProperties != null
                            ? shape.extendProperties.map(inflateExampleObjectProperty)
                            : undefined,
                    baseProperties:
                        shape.baseProperties != null
                            ? shape.baseProperties.map(inflateExampleUnionBaseProperty)
                            : undefined
                });
            case "enum":
                return IrVersions.V65.ExampleTypeShape.enum({
                    ...shape,
                    value: inflateNameAndWireValue(shape.value)
                });
            case "alias":
                return IrVersions.V65.ExampleTypeShape.alias({
                    ...shape,
                    value: inflateExampleTypeReference(shape.value)
                });
            case "undiscriminatedUnion":
                return IrVersions.V65.ExampleTypeShape.undiscriminatedUnion({
                    ...shape,
                    singleUnionType: inflateExampleTypeReference(shape.singleUnionType)
                });
            default:
                return shape;
        }
    };

    const inflateExampleObjectProperty = (
        prop: IrVersions.V65.ExampleObjectProperty
    ): IrVersions.V65.ExampleObjectProperty => ({
        ...prop,
        name: inflateNameAndWireValue(prop.name),
        value: inflateExampleTypeReference(prop.value),
        originalTypeDeclaration: inflateDeclaredTypeName(prop.originalTypeDeclaration)
    });

    const inflateExampleExtraObjectProperty = (
        prop: IrVersions.V65.ExampleExtraObjectProperty
    ): IrVersions.V65.ExampleExtraObjectProperty => ({
        ...prop,
        name: inflateNameAndWireValue(prop.name),
        value: inflateExampleTypeReference(prop.value)
    });

    const inflateExampleUnionBaseProperty = (
        prop: IrVersions.V65.ExampleUnionBaseProperty
    ): IrVersions.V65.ExampleUnionBaseProperty => ({
        ...prop,
        name: inflateNameAndWireValue(prop.name),
        value: inflateExampleTypeReference(prop.value)
    });

    const inflateExampleSingleUnionType = (
        sut: IrVersions.V65.ExampleSingleUnionType
    ): IrVersions.V65.ExampleSingleUnionType => ({
        ...sut,
        wireDiscriminantValue: inflateNameAndWireValue(sut.wireDiscriminantValue),
        shape: inflateExampleSingleUnionTypeProperties(sut.shape)
    });

    const inflateExampleSingleUnionTypeProperties = (
        props: IrVersions.V65.ExampleSingleUnionTypeProperties
    ): IrVersions.V65.ExampleSingleUnionTypeProperties => {
        switch (props.type) {
            case "samePropertiesAsObject":
                return IrVersions.V65.ExampleSingleUnionTypeProperties.samePropertiesAsObject({
                    ...props,
                    object: inflateExampleObjectTypeInShape(props.object)
                });
            case "singleProperty":
                return IrVersions.V65.ExampleSingleUnionTypeProperties.singleProperty(
                    inflateExampleTypeReference(props)
                );
            case "noProperties":
                return props;
            default:
                return props;
        }
    };

    const inflateExampleObjectTypeInShape = (
        obj: IrVersions.V65.ExampleObjectType
    ): IrVersions.V65.ExampleObjectType => ({
        ...obj,
        properties: obj.properties.map(inflateExampleObjectProperty),
        extraProperties:
            obj.extraProperties != null ? obj.extraProperties.map(inflateExampleExtraObjectProperty) : undefined
    });

    // ===== HTTP endpoint inflate =====

    const inflatePathParameter = (pp: IrVersions.V65.PathParameter): IrVersions.V65.PathParameter => ({
        ...pp,
        name: inflateName(pp.name)
    });

    const inflateQueryParameter = (qp: IrVersions.V65.QueryParameter): IrVersions.V65.QueryParameter => ({
        ...qp,
        name: inflateNameAndWireValue(qp.name)
    });

    const inflateHeader = (h: IrVersions.V65.HttpHeader): IrVersions.V65.HttpHeader => ({
        ...h,
        name: inflateNameAndWireValue(h.name)
    });

    const inflateFileProperty = (fp: IrVersions.V65.FileProperty): IrVersions.V65.FileProperty => {
        switch (fp.type) {
            case "file":
                return IrVersions.V65.FileProperty.file({
                    ...fp,
                    key: inflateNameAndWireValue(fp.key)
                });
            case "fileArray":
                return IrVersions.V65.FileProperty.fileArray({
                    ...fp,
                    key: inflateNameAndWireValue(fp.key)
                });
            default:
                return fp;
        }
    };

    const inflateEndpoint = (ep: IrVersions.V65.HttpEndpoint): IrVersions.V65.HttpEndpoint => ({
        ...ep,
        name: inflateName(ep.name),
        allPathParameters: ep.allPathParameters.map(inflatePathParameter),
        pathParameters: ep.pathParameters.map(inflatePathParameter),
        queryParameters: ep.queryParameters.map(inflateQueryParameter),
        headers: ep.headers.map(inflateHeader),
        responseHeaders: ep.responseHeaders != null ? ep.responseHeaders.map(inflateHeader) : undefined,
        requestBody: ep.requestBody != null ? inflateHttpRequestBody(ep.requestBody) : undefined,
        sdkRequest: ep.sdkRequest != null ? inflateSdkRequest(ep.sdkRequest) : undefined,
        pagination: ep.pagination != null ? inflatePagination(ep.pagination) : undefined,
        autogeneratedExamples: ep.autogeneratedExamples.map((ex) => ({
            ...ex,
            example: inflateExampleEndpointCall(ex.example)
        })),
        userSpecifiedExamples: ep.userSpecifiedExamples.map((ex) => ({
            ...ex,
            example: ex.example != null ? inflateExampleEndpointCall(ex.example) : undefined
        }))
    });

    const inflateHttpRequestBody = (rb: IrVersions.V65.HttpRequestBody): IrVersions.V65.HttpRequestBody => {
        switch (rb.type) {
            case "inlinedRequestBody":
                return IrVersions.V65.HttpRequestBody.inlinedRequestBody({
                    ...rb,
                    name: inflateName(rb.name),
                    extends: rb.extends.map(inflateDeclaredTypeName),
                    properties: rb.properties.map((p) => ({
                        ...p,
                        name: inflateNameAndWireValue(p.name)
                    })),
                    extraProperties: rb.extraProperties
                });
            case "fileUpload":
                return IrVersions.V65.HttpRequestBody.fileUpload({
                    ...rb,
                    name: inflateName(rb.name),
                    properties: rb.properties.map((p) => {
                        switch (p.type) {
                            case "bodyProperty":
                                return IrVersions.V65.FileUploadRequestProperty.bodyProperty({
                                    ...p,
                                    name: inflateNameAndWireValue(p.name)
                                });
                            case "file":
                                return IrVersions.V65.FileUploadRequestProperty.file(inflateFileProperty(p.value));
                            default:
                                return p;
                        }
                    })
                });
            default:
                return rb;
        }
    };

    const inflateSdkRequestShape = (shape: IrVersions.V65.SdkRequestShape): IrVersions.V65.SdkRequestShape => {
        switch (shape.type) {
            case "wrapper":
                return IrVersions.V65.SdkRequestShape.wrapper({
                    ...shape,
                    wrapperName: inflateName(shape.wrapperName),
                    bodyKey: inflateName(shape.bodyKey)
                });
            default:
                return shape;
        }
    };

    const inflateSdkRequest = (req: IrVersions.V65.SdkRequest): IrVersions.V65.SdkRequest => ({
        ...req,
        requestParameterName: inflateName(req.requestParameterName),
        shape: inflateSdkRequestShape(req.shape),
        streamParameter: req.streamParameter != null ? inflateRequestProperty(req.streamParameter) : undefined
    });

    // ===== Pagination inflate =====

    const inflateRequestProperty = (rp: IrVersions.V65.RequestProperty): IrVersions.V65.RequestProperty => ({
        ...rp,
        propertyPath: rp.propertyPath != null ? rp.propertyPath.map(inflatePropertyPathItem) : undefined,
        property: inflateRequestPropertyValue(rp.property)
    });

    const inflateRequestPropertyValue = (
        rpv: IrVersions.V65.RequestPropertyValue
    ): IrVersions.V65.RequestPropertyValue => {
        switch (rpv.type) {
            case "query":
                return IrVersions.V65.RequestPropertyValue.query(inflateQueryParameter(rpv));
            case "body":
                return IrVersions.V65.RequestPropertyValue.body(inflateObjectProperty(rpv));
            default:
                return rpv;
        }
    };

    const inflateResponseProperty = (rp: IrVersions.V65.ResponseProperty): IrVersions.V65.ResponseProperty => ({
        ...rp,
        propertyPath: rp.propertyPath != null ? rp.propertyPath.map(inflatePropertyPathItem) : undefined,
        property: inflateObjectProperty(rp.property)
    });

    const inflatePagination = (pagination: IrVersions.V65.Pagination): IrVersions.V65.Pagination => {
        switch (pagination.type) {
            case "cursor":
                return IrVersions.V65.Pagination.cursor({
                    ...pagination,
                    page: inflateRequestProperty(pagination.page),
                    next: inflateResponseProperty(pagination.next),
                    results: inflateResponseProperty(pagination.results)
                });
            case "offset":
                return IrVersions.V65.Pagination.offset({
                    ...pagination,
                    page: inflateRequestProperty(pagination.page),
                    step: pagination.step != null ? inflateRequestProperty(pagination.step) : undefined,
                    results: inflateResponseProperty(pagination.results),
                    hasNextPage:
                        pagination.hasNextPage != null ? inflateResponseProperty(pagination.hasNextPage) : undefined
                });
            default:
                return pagination;
        }
    };

    // ===== Example endpoint call inflate =====

    const inflateExampleEndpointCall = (
        ex: IrVersions.V65.ExampleEndpointCall
    ): IrVersions.V65.ExampleEndpointCall => ({
        ...ex,
        name: inflateOptionalName(ex.name),
        rootPathParameters: ex.rootPathParameters.map(inflateExamplePathParameter),
        servicePathParameters: ex.servicePathParameters.map(inflateExamplePathParameter),
        endpointPathParameters: ex.endpointPathParameters.map(inflateExamplePathParameter),
        queryParameters: ex.queryParameters.map(inflateExampleQueryParameter),
        serviceHeaders: ex.serviceHeaders.map(inflateExampleHeader),
        endpointHeaders: ex.endpointHeaders.map(inflateExampleHeader),
        request: ex.request != null ? inflateExampleRequestBody(ex.request) : undefined,
        response: inflateExampleResponse(ex.response)
    });

    const inflateExamplePathParameter = (
        pp: IrVersions.V65.ExamplePathParameter
    ): IrVersions.V65.ExamplePathParameter => ({
        ...pp,
        name: inflateName(pp.name),
        value: inflateExampleTypeReference(pp.value)
    });

    const inflateExampleQueryParameter = (
        qp: IrVersions.V65.ExampleQueryParameter
    ): IrVersions.V65.ExampleQueryParameter => ({
        ...qp,
        name: inflateNameAndWireValue(qp.name),
        value: inflateExampleTypeReference(qp.value)
    });

    const inflateExampleHeader = (h: IrVersions.V65.ExampleHeader): IrVersions.V65.ExampleHeader => ({
        ...h,
        name: inflateNameAndWireValue(h.name),
        value: inflateExampleTypeReference(h.value)
    });

    const inflateExampleRequestBody = (rb: IrVersions.V65.ExampleRequestBody): IrVersions.V65.ExampleRequestBody => {
        switch (rb.type) {
            case "inlinedRequestBody":
                return IrVersions.V65.ExampleRequestBody.inlinedRequestBody({
                    ...rb,
                    properties: rb.properties.map(inflateExampleInlinedRequestBodyProperty),
                    extraProperties:
                        rb.extraProperties != null
                            ? rb.extraProperties.map(inflateExampleInlinedRequestBodyExtraProperty)
                            : undefined
                });
            case "reference":
                return IrVersions.V65.ExampleRequestBody.reference(inflateExampleTypeReference(rb));
            default:
                return rb;
        }
    };

    const inflateExampleInlinedRequestBodyProperty = (
        prop: IrVersions.V65.ExampleInlinedRequestBodyProperty
    ): IrVersions.V65.ExampleInlinedRequestBodyProperty => ({
        ...prop,
        name: inflateNameAndWireValue(prop.name),
        value: inflateExampleTypeReference(prop.value),
        originalTypeDeclaration:
            prop.originalTypeDeclaration != null ? inflateDeclaredTypeName(prop.originalTypeDeclaration) : undefined
    });

    const inflateExampleInlinedRequestBodyExtraProperty = (
        prop: IrVersions.V65.ExampleInlinedRequestBodyExtraProperty
    ): IrVersions.V65.ExampleInlinedRequestBodyExtraProperty => ({
        ...prop,
        name: inflateNameAndWireValue(prop.name),
        value: inflateExampleTypeReference(prop.value)
    });

    const inflateExampleResponse = (response: IrVersions.V65.ExampleResponse): IrVersions.V65.ExampleResponse => {
        switch (response.type) {
            case "ok":
                return IrVersions.V65.ExampleResponse.ok(inflateExampleEndpointSuccessResponse(response));
            case "error":
                return IrVersions.V65.ExampleResponse.error({
                    ...response,
                    error: inflateDeclaredErrorName(response.error),
                    body: response.body != null ? inflateExampleTypeReference(response.body) : undefined
                });
            default:
                return response;
        }
    };

    const inflateExampleEndpointSuccessResponse = (
        response: IrVersions.V65.ExampleEndpointSuccessResponse
    ): IrVersions.V65.ExampleEndpointSuccessResponse => {
        switch (response.type) {
            case "body":
                return IrVersions.V65.ExampleEndpointSuccessResponse.body(
                    response.value != null ? inflateExampleTypeReference(response.value) : undefined
                );
            case "stream":
                return IrVersions.V65.ExampleEndpointSuccessResponse.stream(
                    response.value.map(inflateExampleTypeReference)
                );
            case "sse":
                return IrVersions.V65.ExampleEndpointSuccessResponse.sse(
                    response.value.map((event) => ({
                        ...event,
                        data: inflateExampleTypeReference(event.data)
                    }))
                );
            default:
                return response;
        }
    };

    // ===== Service inflate =====

    const inflateService = (svc: IrVersions.V65.HttpService): IrVersions.V65.HttpService => ({
        ...svc,
        name: {
            ...svc.name,
            fernFilepath: inflateFernFilepath(svc.name.fernFilepath)
        },
        basePath: svc.basePath,
        pathParameters: svc.pathParameters.map(inflatePathParameter),
        headers: svc.headers.map(inflateHeader),
        endpoints: svc.endpoints.map(inflateEndpoint)
    });

    // ===== Error declaration inflate =====

    const inflateDeclaredErrorName = (name: IrVersions.V65.DeclaredErrorName): IrVersions.V65.DeclaredErrorName => ({
        ...name,
        fernFilepath: inflateFernFilepath(name.fernFilepath),
        name: inflateName(name.name)
    });

    const inflateErrorDeclaration = (err: IrVersions.V65.ErrorDeclaration): IrVersions.V65.ErrorDeclaration => ({
        ...err,
        name: inflateDeclaredErrorName(err.name),
        discriminantValue: inflateNameAndWireValue(err.discriminantValue),
        examples: err.examples.map(inflateExampleError)
    });

    const inflateExampleError = (ex: IrVersions.V65.ExampleError): IrVersions.V65.ExampleError => ({
        ...ex,
        name: inflateOptionalName(ex.name),
        shape: inflateExampleTypeReference(ex.shape)
    });

    // ===== Webhook inflate =====

    const inflateWebhook = (wh: IrVersions.V65.webhooks.Webhook): IrVersions.V65.webhooks.Webhook => ({
        ...wh,
        name: inflateName(wh.name),
        headers: wh.headers.map(inflateHeader),
        payload: inflateWebhookPayload(wh.payload)
    });

    const inflateWebhookPayload = (
        payload: IrVersions.V65.webhooks.WebhookPayload
    ): IrVersions.V65.webhooks.WebhookPayload => {
        switch (payload.type) {
            case "inlinedPayload":
                return IrVersions.V65.webhooks.WebhookPayload.inlinedPayload({
                    ...payload,
                    name: inflateName(payload.name),
                    extends: payload.extends.map(inflateDeclaredTypeName),
                    properties: payload.properties.map((p) => ({
                        ...p,
                        name: inflateNameAndWireValue(p.name)
                    }))
                });
            default:
                return payload;
        }
    };

    // ===== Auth inflate =====

    const inflateAuthScheme = (scheme: IrVersions.V65.AuthScheme): IrVersions.V65.AuthScheme => {
        switch (scheme.type) {
            case "header":
                return IrVersions.V65.AuthScheme.header({
                    ...scheme,
                    name: inflateNameAndWireValue(scheme.name)
                });
            case "bearer":
                return IrVersions.V65.AuthScheme.bearer({
                    ...scheme,
                    token: inflateName(scheme.token)
                });
            case "basic":
                return IrVersions.V65.AuthScheme.basic({
                    ...scheme,
                    username: inflateName(scheme.username),
                    password: inflateName(scheme.password)
                });
            case "oauth":
                return IrVersions.V65.AuthScheme.oauth({
                    ...scheme,
                    configuration: inflateOAuthConfiguration(scheme.configuration)
                });
            default:
                return scheme;
        }
    };

    const inflateOAuthConfiguration = (
        config: IrVersions.V65.OAuthConfiguration
    ): IrVersions.V65.OAuthConfiguration => {
        switch (config.type) {
            case "clientCredentials":
                return IrVersions.V65.OAuthConfiguration.clientCredentials({
                    ...config,
                    tokenEndpoint: {
                        ...config.tokenEndpoint,
                        requestProperties: {
                            ...config.tokenEndpoint.requestProperties,
                            clientId: inflateRequestProperty(config.tokenEndpoint.requestProperties.clientId),
                            clientSecret: inflateRequestProperty(config.tokenEndpoint.requestProperties.clientSecret),
                            scopes:
                                config.tokenEndpoint.requestProperties.scopes != null
                                    ? inflateRequestProperty(config.tokenEndpoint.requestProperties.scopes)
                                    : undefined
                        },
                        responseProperties: {
                            ...config.tokenEndpoint.responseProperties,
                            accessToken: inflateResponseProperty(config.tokenEndpoint.responseProperties.accessToken),
                            expiresIn:
                                config.tokenEndpoint.responseProperties.expiresIn != null
                                    ? inflateResponseProperty(config.tokenEndpoint.responseProperties.expiresIn)
                                    : undefined
                        }
                    },
                    refreshEndpoint:
                        config.refreshEndpoint != null
                            ? {
                                  ...config.refreshEndpoint,
                                  requestProperties: {
                                      ...config.refreshEndpoint.requestProperties,
                                      refreshToken: inflateRequestProperty(
                                          config.refreshEndpoint.requestProperties.refreshToken
                                      )
                                  },
                                  responseProperties: {
                                      ...config.refreshEndpoint.responseProperties,
                                      accessToken: inflateResponseProperty(
                                          config.refreshEndpoint.responseProperties.accessToken
                                      ),
                                      expiresIn:
                                          config.refreshEndpoint.responseProperties.expiresIn != null
                                              ? inflateResponseProperty(
                                                    config.refreshEndpoint.responseProperties.expiresIn
                                                )
                                              : undefined,
                                      refreshToken:
                                          config.refreshEndpoint.responseProperties.refreshToken != null
                                              ? inflateResponseProperty(
                                                    config.refreshEndpoint.responseProperties.refreshToken
                                                )
                                              : undefined
                                  }
                              }
                            : undefined
                });
            default:
                return config;
        }
    };

    // ===== Subpackage / Variable / Channel inflate =====

    const inflateSubpackage = (sp: IrVersions.V65.Subpackage): IrVersions.V65.Subpackage => ({
        ...sp,
        name: inflateName(sp.name),
        fernFilepath: inflateFernFilepath(sp.fernFilepath)
    });

    const inflateVariable = (v: IrVersions.V65.VariableDeclaration): IrVersions.V65.VariableDeclaration => ({
        ...v,
        name: inflateName(v.name)
    });

    const inflateChannel = (
        ch: IrVersions.V65.websocket.WebSocketChannel
    ): IrVersions.V65.websocket.WebSocketChannel => ({
        ...ch,
        name: inflateName(ch.name),
        headers: ch.headers.map(inflateHeader),
        queryParameters: ch.queryParameters.map(inflateQueryParameter),
        pathParameters: ch.pathParameters.map(inflatePathParameter),
        messages: ch.messages.map((msg) => ({
            ...msg,
            body: inflateWebSocketMessageBody(msg.body)
        }))
    });

    const inflateWebSocketMessageBody = (
        body: IrVersions.V65.websocket.WebSocketMessageBody
    ): IrVersions.V65.websocket.WebSocketMessageBody => {
        switch (body.type) {
            case "inlinedBody":
                return IrVersions.V65.websocket.WebSocketMessageBody.inlinedBody({
                    ...body,
                    name: inflateName(body.name),
                    extends: body.extends.map(inflateDeclaredTypeName),
                    properties: body.properties.map((p) => ({
                        ...p,
                        name: inflateNameAndWireValue(p.name)
                    }))
                });
            default:
                return body;
        }
    };

    // ===== Environment inflate =====

    const inflateEnvironmentsConfig = (
        config: IrVersions.V65.EnvironmentsConfig | undefined
    ): IrVersions.V65.EnvironmentsConfig | undefined => {
        if (config == null) {
            return undefined;
        }
        switch (config.environments.type) {
            case "singleBaseUrl":
                return {
                    ...config,
                    environments: IrVersions.V65.Environments.singleBaseUrl({
                        ...config.environments,
                        environments: config.environments.environments.map((env) => ({
                            ...env,
                            name: inflateName(env.name)
                        }))
                    })
                };
            case "multipleBaseUrls":
                return {
                    ...config,
                    environments: IrVersions.V65.Environments.multipleBaseUrls({
                        ...config.environments,
                        environments: config.environments.environments.map((env) => ({
                            ...env,
                            name: inflateName(env.name)
                        }))
                    })
                };
            default:
                return config;
        }
    };

    // ===== Error discrimination strategy inflate =====

    const inflateErrorDiscriminationStrategy = (
        strategy: IrVersions.V65.ErrorDiscriminationStrategy
    ): IrVersions.V65.ErrorDiscriminationStrategy => {
        switch (strategy.type) {
            case "property":
                return IrVersions.V65.ErrorDiscriminationStrategy.property({
                    ...strategy,
                    discriminant: inflateNameAndWireValue(strategy.discriminant),
                    contentProperty: inflateNameAndWireValue(strategy.contentProperty)
                });
            default:
                return strategy;
        }
    };

    // ===== Build the inflated IR =====

    const inflatedTypes: Record<string, IrVersions.V65.TypeDeclaration> = {};
    for (const [id, td] of Object.entries(ir.types)) {
        inflatedTypes[id] = inflateTypeDeclaration(td);
    }

    const inflatedErrors: Record<string, IrVersions.V65.ErrorDeclaration> = {};
    for (const [id, err] of Object.entries(ir.errors)) {
        inflatedErrors[id] = inflateErrorDeclaration(err);
    }

    const inflatedServices: Record<string, IrVersions.V65.HttpService> = {};
    for (const [id, svc] of Object.entries(ir.services)) {
        inflatedServices[id] = inflateService(svc);
    }

    const inflatedWebhookGroups: Record<string, IrVersions.V65.webhooks.Webhook[]> = {};
    for (const [id, group] of Object.entries(ir.webhookGroups)) {
        inflatedWebhookGroups[id] = group.map(inflateWebhook);
    }

    const inflatedChannels: Record<string, IrVersions.V65.websocket.WebSocketChannel> | undefined =
        ir.websocketChannels != null
            ? Object.fromEntries(Object.entries(ir.websocketChannels).map(([id, ch]) => [id, inflateChannel(ch)]))
            : undefined;

    const inflatedSubpackages: Record<string, IrVersions.V65.Subpackage> = {};
    for (const [id, sp] of Object.entries(ir.subpackages)) {
        inflatedSubpackages[id] = inflateSubpackage(sp);
    }

    return {
        ...ir,
        apiName: inflateName(ir.apiName),
        types: inflatedTypes,
        errors: inflatedErrors,
        services: inflatedServices,
        webhookGroups: inflatedWebhookGroups,
        websocketChannels: inflatedChannels,
        subpackages: inflatedSubpackages,
        rootPackage: {
            ...ir.rootPackage,
            fernFilepath: inflateFernFilepath(ir.rootPackage.fernFilepath)
        },
        headers: ir.headers.map(inflateHeader),
        idempotencyHeaders: ir.idempotencyHeaders.map(inflateHeader),
        pathParameters: ir.pathParameters.map(inflatePathParameter),
        variables: ir.variables.map(inflateVariable),
        auth: {
            ...ir.auth,
            schemes: ir.auth.schemes.map(inflateAuthScheme)
        },
        constants: {
            ...ir.constants,
            errorInstanceIdKey: inflateNameAndWireValue(ir.constants.errorInstanceIdKey)
        },
        environments: inflateEnvironmentsConfig(ir.environments),
        errorDiscriminationStrategy: inflateErrorDiscriminationStrategy(ir.errorDiscriminationStrategy)
    };
}
