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
 * Inflates all NameOrString (string) values in the IR back to full Name objects,
 * and all NameAndWireValueOrString (string) values back to full NameAndWireValue objects.
 * This is needed for generators that haven't been updated to handle the compact string form.
 */
function inflateIr(
    ir: IrVersions.V65.ir.IntermediateRepresentation,
    casingsGenerator: CasingsGenerator
): IrVersions.V65.ir.IntermediateRepresentation {
    const inflateName = (name: IrVersions.V65.NameOrString): IrVersions.V65.Name => {
        if (typeof name === "string") {
            return casingsGenerator.generateName(name);
        }
        return name;
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

    const inflateExampleType = (ex: IrVersions.V65.ExampleType): IrVersions.V65.ExampleType => ({
        ...ex,
        name: ex.name != null ? inflateName(ex.name) : undefined,
        shape: inflateExampleTypeShape(ex.shape)
    });

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

    const inflateExampleTypeShape = (shape: IrVersions.V65.ExampleTypeShape): IrVersions.V65.ExampleTypeShape => {
        switch (shape.type) {
            case "object":
                return IrVersions.V65.ExampleTypeShape.object({
                    ...shape,
                    properties: shape.properties.map((p) => ({
                        ...p,
                        name: inflateNameAndWireValue(p.name)
                    }))
                });
            case "union": {
                const singleUnionType = shape.singleUnionType;
                return IrVersions.V65.ExampleTypeShape.union({
                    ...shape,
                    discriminant: inflateNameAndWireValue(shape.discriminant),
                    singleUnionType: {
                        ...singleUnionType,
                        wireDiscriminantValue: inflateNameAndWireValue(singleUnionType.wireDiscriminantValue)
                    }
                });
            }
            case "enum":
                return IrVersions.V65.ExampleTypeShape.enum({
                    ...shape,
                    value: inflateNameAndWireValue(shape.value)
                });
            default:
                return shape;
        }
    };

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
        requestBody: ep.requestBody != null ? inflateRequestBody(ep.requestBody) : undefined,
        sdkRequest: ep.sdkRequest != null ? inflateSdkRequest(ep.sdkRequest) : undefined,
        autogeneratedExamples: ep.autogeneratedExamples.map((ex) => ({
            ...ex,
            example: inflateExampleEndpointCall(ex.example)
        })),
        userSpecifiedExamples: ep.userSpecifiedExamples.map((ex) => ({
            ...ex,
            example: ex.example != null ? inflateExampleEndpointCall(ex.example) : undefined
        }))
    });

    const inflateRequestBody = (rb: IrVersions.V65.HttpRequestBody): IrVersions.V65.HttpRequestBody => {
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
                                return IrVersions.V65.FileUploadRequestProperty.file(
                                    inflateFileProperty(p.value)
                                );
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
        shape: inflateSdkRequestShape(req.shape)
    });

    const inflateExampleEndpointCall = (
        ex: IrVersions.V65.ExampleEndpointCall
    ): IrVersions.V65.ExampleEndpointCall => ({
        ...ex,
        name: ex.name != null ? inflateName(ex.name) : undefined,
        rootPathParameters: ex.rootPathParameters.map(inflateExamplePathParameter),
        servicePathParameters: ex.servicePathParameters.map(inflateExamplePathParameter),
        endpointPathParameters: ex.endpointPathParameters.map(inflateExamplePathParameter),
        queryParameters: ex.queryParameters.map(inflateExampleQueryParameter),
        serviceHeaders: ex.serviceHeaders.map(inflateExampleHeader),
        endpointHeaders: ex.endpointHeaders.map(inflateExampleHeader),
        request: ex.request != null ? inflateExampleRequestBody(ex.request) : undefined
    });

    const inflateExamplePathParameter = (
        pp: IrVersions.V65.ExamplePathParameter
    ): IrVersions.V65.ExamplePathParameter => ({
        ...pp,
        name: inflateName(pp.name)
    });

    const inflateExampleQueryParameter = (
        qp: IrVersions.V65.ExampleQueryParameter
    ): IrVersions.V65.ExampleQueryParameter => ({
        ...qp,
        name: inflateNameAndWireValue(qp.name)
    });

    const inflateExampleHeader = (h: IrVersions.V65.ExampleHeader): IrVersions.V65.ExampleHeader => ({
        ...h,
        name: inflateNameAndWireValue(h.name)
    });

    const inflateExampleRequestBody = (rb: IrVersions.V65.ExampleRequestBody): IrVersions.V65.ExampleRequestBody => {
        switch (rb.type) {
            case "inlinedRequestBody":
                return IrVersions.V65.ExampleRequestBody.inlinedRequestBody({
                    ...rb,
                    properties: rb.properties.map((p) => ({
                        ...p,
                        name: inflateNameAndWireValue(p.name)
                    }))
                });
            default:
                return rb;
        }
    };

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

    const inflateErrorDeclaration = (err: IrVersions.V65.ErrorDeclaration): IrVersions.V65.ErrorDeclaration => ({
        ...err,
        name: {
            ...err.name,
            fernFilepath: inflateFernFilepath(err.name.fernFilepath),
            name: inflateName(err.name.name)
        },
        discriminantValue: inflateNameAndWireValue(err.discriminantValue)
    });

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

    const inflateRequestProperty = (rp: IrVersions.V65.RequestProperty): IrVersions.V65.RequestProperty => ({
        ...rp,
        property: {
            ...rp.property,
            name: inflateNameAndWireValue(rp.property.name)
        }
    });

    const inflateResponseProperty = (rp: IrVersions.V65.ResponseProperty): IrVersions.V65.ResponseProperty => ({
        ...rp,
        property: inflateObjectProperty(rp.property)
    });

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

    // Build the inflated IR
    const { types, errors, services, webhookGroups, websocketChannels, subpackages, rootPackage, constants, ...rest } =
        ir;

    const inflatedTypes: Record<string, IrVersions.V65.TypeDeclaration> = {};
    for (const [id, td] of Object.entries(types)) {
        inflatedTypes[id] = inflateTypeDeclaration(td);
    }

    const inflatedErrors: Record<string, IrVersions.V65.ErrorDeclaration> = {};
    for (const [id, err] of Object.entries(errors)) {
        inflatedErrors[id] = inflateErrorDeclaration(err);
    }

    const inflatedServices: Record<string, IrVersions.V65.HttpService> = {};
    for (const [id, svc] of Object.entries(services)) {
        inflatedServices[id] = inflateService(svc);
    }

    const inflatedWebhookGroups: Record<string, IrVersions.V65.webhooks.Webhook[]> = {};
    for (const [id, group] of Object.entries(webhookGroups)) {
        inflatedWebhookGroups[id] = group.map(inflateWebhook);
    }

    const inflatedChannels: Record<string, IrVersions.V65.websocket.WebSocketChannel> | undefined =
        websocketChannels != null
            ? Object.fromEntries(Object.entries(websocketChannels).map(([id, ch]) => [id, inflateChannel(ch)]))
            : undefined;

    const inflatedSubpackages: Record<string, IrVersions.V65.Subpackage> = {};
    for (const [id, sp] of Object.entries(subpackages)) {
        inflatedSubpackages[id] = inflateSubpackage(sp);
    }

    return {
        ...rest,
        types: inflatedTypes,
        errors: inflatedErrors,
        services: inflatedServices,
        webhookGroups: inflatedWebhookGroups,
        websocketChannels: inflatedChannels,
        subpackages: inflatedSubpackages,
        rootPackage: {
            ...rootPackage,
            fernFilepath: inflateFernFilepath(rootPackage.fernFilepath)
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
            ...constants,
            errorInstanceIdKey: inflateNameAndWireValue(constants.errorInstanceIdKey)
        },
        errorDiscriminationStrategy: inflateErrorDiscriminationStrategy(ir.errorDiscriminationStrategy)
    };

    function inflateErrorDiscriminationStrategy(
        strategy: IrVersions.V65.ErrorDiscriminationStrategy
    ): IrVersions.V65.ErrorDiscriminationStrategy {
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
    }
}
