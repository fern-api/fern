package com.fern.java.client.generators;

import com.fern.ir.model.auth.OAuthAccessTokenRequestProperties;
import com.fern.ir.model.auth.OAuthClientCredentials;
import com.fern.ir.model.commons.EndpointId;
import com.fern.ir.model.commons.EndpointReference;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpRequestBody;
import com.fern.ir.model.http.HttpResponseBody;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.InlinedRequestBody;
import com.fern.ir.model.http.InlinedRequestBodyProperty;
import com.fern.ir.model.http.JsonResponseBody;
import com.fern.ir.model.http.RequestProperty;
import com.fern.ir.model.http.ResponseProperty;
import com.fern.ir.model.http.SdkRequestBodyType;
import com.fern.ir.model.http.SdkRequestShape.Visitor;
import com.fern.ir.model.http.SdkRequestWrapper;
import com.fern.ir.model.ir.Subpackage;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.generators.visitors.RequestPropertyToNameVisitor;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.TypeSpec.Builder;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public class OAuthTokenSupplierGenerator extends AbstractFileGenerator {

    private static final String CLIENT_ID_FIELD_NAME = "clientId";
    private static final String CLIENT_SECRET_FIELD_NAME = "clientSecret";
    private static final String ACCESS_TOKEN_FIELD_NAME = "accessToken";
    private static final String AUTH_CLIENT_NAME = "authClient";
    private static final String GET_TOKEN_REQUEST_NAME = "getTokenRequest";
    private static final String EXPIRES_AT_FIELD_NAME = "expiresAt";
    private static final String BUFFER_IN_MINUTES_CONSTANT_NAME = "BUFFER_IN_MINUTES";
    private static final String EXPIRES_IN_SECONDS_PARAMETER_NAME = "expiresInSeconds";

    private static final String FETCH_TOKEN_METHOD_NAME = "fetchToken";
    private static final String GET_METHOD_NAME = "get";
    private static final String GET_EXPIRES_AT_METHOD_NAME = "getExpiresAt";

    private final OAuthClientCredentials clientCredentials;
    private final ClientGeneratorContext clientGeneratorContext;

    public OAuthTokenSupplierGenerator(
            ClientGeneratorContext clientGeneratorContext, OAuthClientCredentials clientCredentials) {
        super(
                clientGeneratorContext.getPoetClassNameFactory().getCoreClassName("OAuthTokenSupplier"),
                clientGeneratorContext);
        this.clientCredentials = clientCredentials;
        this.clientGeneratorContext = clientGeneratorContext;
    }

    @Override
    public GeneratedJavaFile generateFile() {
        validateSupportedConfiguration(clientCredentials);
        EndpointReference tokenEndpointReference =
                clientCredentials.getTokenEndpoint().getEndpointReference();
        HttpService httpService = generatorContext.getIr().getServices().get(tokenEndpointReference.getServiceId());
        EndpointId endpointId = tokenEndpointReference.getEndpointId();
        HttpEndpoint httpEndpoint = httpService.getEndpoints().stream()
                .filter(it -> it.getId().equals(endpointId))
                .findFirst()
                .orElseThrow();
        Subpackage subpackage = generatorContext
                .getIr()
                .getSubpackages()
                .get(tokenEndpointReference.getSubpackageId().get());
        ClassName authClientClassName =
                clientGeneratorContext.getPoetClassNameFactory().getClientClassName(subpackage);
        OAuthAccessTokenRequestProperties requestProperties =
                clientCredentials.getTokenEndpoint().getRequestProperties();
        String clientIdPropertyName = requestProperties
                .getClientId()
                .getProperty()
                .visit(new RequestPropertyToNameVisitor())
                .getName()
                .getCamelCase()
                .getUnsafeName();
        String clientSecretPropertyName = requestProperties
                .getClientSecret()
                .getProperty()
                .visit(new RequestPropertyToNameVisitor())
                .getName()
                .getCamelCase()
                .getUnsafeName();

        Map<String, RequestPropertyInfo> allOAuthProperties = collectOAuthProperties(requestProperties, httpEndpoint);
        List<BuilderProperty> orderedBuilderProperties =
                getOrderedBuilderProperties(httpEndpoint, clientIdPropertyName, clientSecretPropertyName, allOAuthProperties);
        List<BuilderProperty> nonLiteralProperties = orderedBuilderProperties.stream()
                .filter(p -> !p.isLiteral)
                .collect(Collectors.toList());

        TypeName fetchTokenRequestType = getFetchTokenRequestType(httpEndpoint, httpService);
        HttpResponseBody tokenHttpResponseBody =
                httpEndpoint.getResponse().get().getBody().get();
        JsonResponseBody jsonResponseBody = tokenHttpResponseBody
                .getJson()
                .orElseThrow(() -> new RuntimeException("Unexpected non json response type for token endpoint"))
                .getResponse()
                .get();
        TypeName fetchTokenReturnType = clientGeneratorContext
                .getPoetTypeNameMapper()
                .convertToTypeName(true, jsonResponseBody.getResponseBodyType());
        String accessTokenResponsePropertyName = clientCredentials
                .getTokenEndpoint()
                .getResponseProperties()
                .getAccessToken()
                .getProperty()
                .getName()
                .getName()
                .getPascalCase()
                .getUnsafeName();
        ParameterizedTypeName supplierOfString =
                ParameterizedTypeName.get(ClassName.get(Supplier.class), ClassName.get(String.class));
        Optional<ResponseProperty> expiryResponseProperty =
                clientCredentials.getTokenEndpoint().getResponseProperties().getExpiresIn();
        boolean refreshRequired = expiryResponseProperty.isPresent();
        MethodSpec.Builder getMethodSpecBuilder = MethodSpec.methodBuilder(GET_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(ClassName.get("", "java.lang.Override"))
                .returns(String.class)
                .beginControlFlow(
                        refreshRequired
                                ? CodeBlock.builder()
                                        .add(
                                                "if ($L == null || $L.isBefore($T.now()))",
                                                ACCESS_TOKEN_FIELD_NAME,
                                                EXPIRES_AT_FIELD_NAME,
                                                Instant.class)
                                        .build()
                                : CodeBlock.builder()
                                        .add("if ($L == null)", ACCESS_TOKEN_FIELD_NAME)
                                        .build())
                .addStatement("$T authResponse = $L()", fetchTokenReturnType, FETCH_TOKEN_METHOD_NAME)
                .addStatement(
                        "this.$L = authResponse.get$L()", ACCESS_TOKEN_FIELD_NAME, accessTokenResponsePropertyName);
        if (refreshRequired) {
            String tokenPropertyName = expiryResponseProperty
                    .get()
                    .getProperty()
                    .getName()
                    .getName()
                    .getPascalCase()
                    .getUnsafeName();
            getMethodSpecBuilder.addStatement(
                    "this.$L = $L(authResponse.get$L())",
                    EXPIRES_AT_FIELD_NAME,
                    GET_EXPIRES_AT_METHOD_NAME,
                    tokenPropertyName);
        }
        getMethodSpecBuilder
                .endControlFlow()
                .addStatement(
                        "return $S + $L",
                        clientCredentials.getTokenPrefix().orElse("Bearer") + " ",
                        ACCESS_TOKEN_FIELD_NAME);
        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC);

        for (BuilderProperty prop : nonLiteralProperties) {
            constructorBuilder.addParameter(String.class, prop.fieldName);
        }

        constructorBuilder.addParameter(authClientClassName, AUTH_CLIENT_NAME);

        for (BuilderProperty prop : nonLiteralProperties) {
            constructorBuilder.addStatement("this.$L = $L", prop.fieldName, prop.fieldName);
        }

        constructorBuilder.addStatement("this.$L = $L", AUTH_CLIENT_NAME, AUTH_CLIENT_NAME);

        if (refreshRequired) {
            constructorBuilder.addStatement("this.$L = $T.now()", EXPIRES_AT_FIELD_NAME, Instant.class);
        }
        Builder oauthTypeSpecBuilder = TypeSpec.classBuilder(className)
                .addSuperinterface(supplierOfString)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL);

        for (BuilderProperty prop : nonLiteralProperties) {
            oauthTypeSpecBuilder.addField(
                    FieldSpec.builder(String.class, prop.fieldName, Modifier.PRIVATE, Modifier.FINAL)
                            .build());
        }

        oauthTypeSpecBuilder
                .addField(FieldSpec.builder(authClientClassName, AUTH_CLIENT_NAME, Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addField(FieldSpec.builder(String.class, ACCESS_TOKEN_FIELD_NAME, Modifier.PRIVATE)
                        .build())
                .addMethod(constructorBuilder.build())
                .addMethod(buildFetchTokenMethod(fetchTokenReturnType, fetchTokenRequestType, orderedBuilderProperties, httpEndpoint))
                .addMethod(getMethodSpecBuilder.build());
        if (refreshRequired) {
            oauthTypeSpecBuilder
                    .addField(FieldSpec.builder(Instant.class, EXPIRES_AT_FIELD_NAME, Modifier.PRIVATE)
                            .build())
                    .addField(FieldSpec.builder(
                                    long.class,
                                    BUFFER_IN_MINUTES_CONSTANT_NAME,
                                    Modifier.PRIVATE,
                                    Modifier.STATIC,
                                    Modifier.FINAL)
                            .initializer("2")
                            .build())
                    .addMethod(MethodSpec.methodBuilder(GET_EXPIRES_AT_METHOD_NAME)
                            .addModifiers(Modifier.PRIVATE)
                            .returns(Instant.class)
                            .addParameter(long.class, EXPIRES_IN_SECONDS_PARAMETER_NAME)
                            .addStatement(
                                    "return $T.now().plus($L, $T.SECONDS).minus($L, $T.MINUTES)",
                                    Instant.class,
                                    EXPIRES_IN_SECONDS_PARAMETER_NAME,
                                    ChronoUnit.class,
                                    BUFFER_IN_MINUTES_CONSTANT_NAME,
                                    ChronoUnit.class)
                            .build());
        }
        JavaFile authHeaderFile = JavaFile.builder(className.packageName(), oauthTypeSpecBuilder.build())
                .build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(authHeaderFile)
                .build();
    }

    private static void validateSupportedConfiguration(OAuthClientCredentials clientCredentials) {
        if (clientCredentials.getRefreshEndpoint().isPresent())
            throw new RuntimeException("Refresh endpoints not supported");
        if (clientCredentials.getScopes().isPresent()
                && !clientCredentials.getScopes().get().isEmpty()) throw new RuntimeException("Scopes not supported");
    }

    /**
     * Collects all OAuth-related properties (clientId, clientSecret, scopes, custom properties, headers) into a map
     * keyed by property name for easy lookup.
     */
    private Map<String, RequestPropertyInfo> collectOAuthProperties(
            OAuthAccessTokenRequestProperties requestProperties, HttpEndpoint httpEndpoint) {
        Map<String, RequestPropertyInfo> properties = new HashMap<>();

        String clientIdName = requestProperties
                .getClientId()
                .getProperty()
                .visit(new RequestPropertyToNameVisitor())
                .getName()
                .getCamelCase()
                .getUnsafeName();
        properties.put(clientIdName, new RequestPropertyInfo(clientIdName, CLIENT_ID_FIELD_NAME));

        String clientSecretName = requestProperties
                .getClientSecret()
                .getProperty()
                .visit(new RequestPropertyToNameVisitor())
                .getName()
                .getCamelCase()
                .getUnsafeName();
        properties.put(clientSecretName, new RequestPropertyInfo(clientSecretName, CLIENT_SECRET_FIELD_NAME));

        if (requestProperties.getScopes().isPresent()) {
            String scopesName = requestProperties
                    .getScopes()
                    .get()
                    .getProperty()
                    .visit(new RequestPropertyToNameVisitor())
                    .getName()
                    .getCamelCase()
                    .getUnsafeName();
            properties.put(scopesName, new RequestPropertyInfo(scopesName, scopesName));
        }

        if (requestProperties.getCustomProperties().isPresent()) {
            for (RequestProperty customProp : requestProperties.getCustomProperties().get()) {
                String propName = customProp
                        .getProperty()
                        .visit(new RequestPropertyToNameVisitor())
                        .getName()
                        .getCamelCase()
                        .getUnsafeName();
                properties.put(propName, new RequestPropertyInfo(propName, propName));
            }
        }

        for (var header : httpEndpoint.getHeaders()) {
            String headerName = header.getName().getName().getCamelCase().getUnsafeName();
            properties.put(headerName, new RequestPropertyInfo(headerName, headerName));
        }

        return properties;
    }

    /**
     * Returns builder properties in the correct order for staged builders: required properties first
     * (in their definition order), then optional properties. Literal properties are included but marked
     * as such so they can be skipped when generating constructor parameters and fields.
     */
    private List<BuilderProperty> getOrderedBuilderProperties(
            HttpEndpoint httpEndpoint,
            String clientIdPropertyName,
            String clientSecretPropertyName,
            Map<String, RequestPropertyInfo> allOAuthProperties) {
        List<BuilderProperty> requiredProperties = new ArrayList<>();
        List<BuilderProperty> optionalProperties = new ArrayList<>();
        Set<String> processedProperties = new HashSet<>();

        if (httpEndpoint.getRequestBody().isPresent()) {
            httpEndpoint.getRequestBody().get().visit(new HttpRequestBody.Visitor<Void>() {
                @Override
                public Void visitInlinedRequestBody(InlinedRequestBody inlinedRequestBody) {
                    for (InlinedRequestBodyProperty prop : inlinedRequestBody.getProperties()) {
                        String propName = prop.getName().getName().getCamelCase().getUnsafeName();
                        RequestPropertyInfo oauthProp = allOAuthProperties.get(propName);
                        if (oauthProp == null) {
                            continue;
                        }

                        processedProperties.add(propName);
                        boolean isLiteral = isLiteralType(prop.getValueType());
                        boolean isOptional = isOptionalType(prop.getValueType());

                        BuilderProperty builderProp = new BuilderProperty(propName, oauthProp.fieldName, isLiteral);

                        if (isLiteral) {
                            continue;
                        } else if (isOptional) {
                            optionalProperties.add(builderProp);
                        } else {
                            requiredProperties.add(builderProp);
                        }
                    }
                    return null;
                }

                @Override
                public Void visitReference(com.fern.ir.model.http.HttpRequestBodyReference reference) {
                    return null;
                }

                @Override
                public Void visitFileUpload(com.fern.ir.model.http.FileUploadRequest fileUpload) {
                    return null;
                }

                @Override
                public Void visitBytes(com.fern.ir.model.http.BytesRequest bytes) {
                    return null;
                }

                @Override
                public Void _visitUnknown(Object unknownType) {
                    return null;
                }
            });
        }

        for (Map.Entry<String, RequestPropertyInfo> entry : allOAuthProperties.entrySet()) {
            if (!processedProperties.contains(entry.getKey())) {
                optionalProperties.add(new BuilderProperty(entry.getValue().builderMethodName, entry.getValue().fieldName, false));
            }
        }

        List<BuilderProperty> result = new ArrayList<>();
        result.addAll(requiredProperties);
        result.addAll(optionalProperties);
        return result;
    }

    private boolean isLiteralType(TypeReference typeReference) {
        if (typeReference.isContainer()) {
            ContainerType container = typeReference.getContainer().get();
            return container.isLiteral();
        }
        return false;
    }

    private boolean isOptionalType(TypeReference typeReference) {
        if (typeReference.isContainer()) {
            ContainerType container = typeReference.getContainer().get();
            return container.isOptional() || container.isNullable();
        }
        return false;
    }

    /**
     * Builds the fetchToken method that constructs the token request and calls the auth client.
     * Properties are added to the builder in the correct staged builder order.
     */
    private MethodSpec buildFetchTokenMethod(
            TypeName fetchTokenReturnType,
            TypeName fetchTokenRequestType,
            List<BuilderProperty> orderedBuilderProperties,
            HttpEndpoint httpEndpoint) {
        CodeBlock.Builder requestBuilderCode = CodeBlock.builder()
                .add("$T $L = $T.builder()", fetchTokenRequestType, GET_TOKEN_REQUEST_NAME, fetchTokenRequestType);

        for (BuilderProperty prop : orderedBuilderProperties) {
            if (!prop.isLiteral) {
                requestBuilderCode.add(".$L($L)", prop.builderMethodName, prop.fieldName);
            }
        }

        requestBuilderCode.add(".build()");

        return MethodSpec.methodBuilder(FETCH_TOKEN_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .returns(fetchTokenReturnType)
                .addStatement(requestBuilderCode.build())
                .addStatement(
                        "return $L.$L($L)",
                        AUTH_CLIENT_NAME,
                        httpEndpoint.getName().get().getCamelCase().getUnsafeName(),
                        GET_TOKEN_REQUEST_NAME)
                .build();
    }

    private TypeName getFetchTokenRequestType(HttpEndpoint httpEndpoint, HttpService httpService) {
        return httpEndpoint.getSdkRequest().get().getShape().visit(new Visitor<>() {
            @Override
            public TypeName visitJustRequestBody(SdkRequestBodyType justRequestBody) {
                TypeReference requestBodyType =
                        justRequestBody.getTypeReference().get().getRequestBodyType();
                return clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, requestBodyType);
            }

            @Override
            public TypeName visitWrapper(SdkRequestWrapper wrapper) {
                return clientGeneratorContext
                        .getPoetClassNameFactory()
                        .getRequestWrapperBodyClassName(httpService, wrapper);
            }

            @Override
            public TypeName _visitUnknown(Object unknownType) {
                throw new RuntimeException("Unknown SdkRequestShape: " + unknownType);
            }
        });
    }

    private static class RequestPropertyInfo {
        final String builderMethodName;
        final String fieldName;

        RequestPropertyInfo(String builderMethodName, String fieldName) {
            this.builderMethodName = builderMethodName;
            this.fieldName = fieldName;
        }
    }

    private static class BuilderProperty {
        final String builderMethodName;
        final String fieldName;
        final boolean isLiteral;

        BuilderProperty(String builderMethodName, String fieldName, boolean isLiteral) {
            this.builderMethodName = builderMethodName;
            this.fieldName = fieldName;
            this.isLiteral = isLiteral;
        }
    }
}
