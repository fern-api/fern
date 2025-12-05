package com.fern.java.client.generators;

import com.fern.ir.model.auth.InferredAuthScheme;
import com.fern.ir.model.auth.InferredAuthSchemeTokenEndpoint;
import com.fern.ir.model.auth.InferredAuthenticatedRequestHeader;
import com.fern.ir.model.commons.EndpointId;
import com.fern.ir.model.commons.EndpointReference;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpHeader;
import com.fern.ir.model.http.HttpResponseBody;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.InlinedRequestBody;
import com.fern.ir.model.http.InlinedRequestBodyProperty;
import com.fern.ir.model.http.JsonResponseBody;
import com.fern.ir.model.http.ResponseProperty;
import com.fern.ir.model.http.SdkRequestBodyType;
import com.fern.ir.model.http.SdkRequestShape;
import com.fern.ir.model.http.SdkRequestWrapper;
import com.fern.ir.model.ir.Subpackage;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.Literal;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.client.ClientGeneratorContext;
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
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;
import javax.lang.model.element.Modifier;

/**
 * Generates the InferredAuthTokenSupplier class that handles token retrieval
 * for inferred authentication schemes. Similar to OAuthTokenSupplierGenerator
 * but more flexible - supports custom token endpoints with arbitrary properties.
 */
public class InferredAuthTokenSupplierGenerator extends AbstractFileGenerator {

    private static final String ACCESS_TOKEN_FIELD_NAME = "accessToken";
    private static final String AUTH_CLIENT_NAME = "authClient";
    private static final String GET_TOKEN_REQUEST_NAME = "getTokenRequest";
    private static final String EXPIRES_AT_FIELD_NAME = "expiresAt";
    private static final String BUFFER_IN_MINUTES_CONSTANT_NAME = "BUFFER_IN_MINUTES";
    private static final String EXPIRES_IN_SECONDS_PARAMETER_NAME = "expiresInSeconds";
    private static final String CACHED_HEADERS_FIELD_NAME = "cachedHeaders";

    private static final String FETCH_TOKEN_METHOD_NAME = "fetchToken";
    private static final String GET_METHOD_NAME = "get";
    private static final String GET_EXPIRES_AT_METHOD_NAME = "getExpiresAt";

    private final InferredAuthScheme inferredAuthScheme;
    private final ClientGeneratorContext clientGeneratorContext;

    public InferredAuthTokenSupplierGenerator(
            ClientGeneratorContext clientGeneratorContext, InferredAuthScheme inferredAuthScheme) {
        super(
                clientGeneratorContext.getPoetClassNameFactory().getCoreClassName("InferredAuthTokenSupplier"),
                clientGeneratorContext);
        this.inferredAuthScheme = inferredAuthScheme;
        this.clientGeneratorContext = clientGeneratorContext;
    }

    @Override
    public GeneratedJavaFile generateFile() {
        InferredAuthSchemeTokenEndpoint tokenEndpoint = inferredAuthScheme.getTokenEndpoint();
        EndpointReference tokenEndpointReference = tokenEndpoint.getEndpoint();

        HttpService httpService = generatorContext.getIr().getServices().get(tokenEndpointReference.getServiceId());
        EndpointId endpointId = tokenEndpointReference.getEndpointId();
        HttpEndpoint httpEndpoint = httpService.getEndpoints().stream()
                .filter(it -> it.getId().equals(endpointId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Could not find token endpoint"));

        Subpackage subpackage = generatorContext
                .getIr()
                .getSubpackages()
                .get(tokenEndpointReference.getSubpackageId().get());
        ClassName authClientClassName =
                clientGeneratorContext.getPoetClassNameFactory().getClientClassName(subpackage);

        List<CredentialProperty> credentialProperties = collectCredentialProperties(httpEndpoint);

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

        List<InferredAuthenticatedRequestHeader> authenticatedHeaders = tokenEndpoint.getAuthenticatedRequestHeaders();

        Optional<ResponseProperty> expiryProperty = tokenEndpoint.getExpiryProperty();
        boolean refreshRequired = expiryProperty.isPresent();

        ParameterizedTypeName mapStringString =
                ParameterizedTypeName.get(ClassName.get(Map.class), ClassName.get(String.class), ClassName.get(String.class));
        ParameterizedTypeName supplierOfMap =
                ParameterizedTypeName.get(ClassName.get(Supplier.class), mapStringString);

        MethodSpec.Builder getMethodSpecBuilder = MethodSpec.methodBuilder(GET_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(ClassName.get("", "java.lang.Override"))
                .returns(mapStringString)
                .beginControlFlow(
                        refreshRequired
                                ? CodeBlock.builder()
                                        .add(
                                                "if ($L == null || $L.isBefore($T.now()))",
                                                CACHED_HEADERS_FIELD_NAME,
                                                EXPIRES_AT_FIELD_NAME,
                                                Instant.class)
                                        .build()
                                : CodeBlock.builder()
                                        .add("if ($L == null)", CACHED_HEADERS_FIELD_NAME)
                                        .build())
                .addStatement("$T tokenResponse = $L()", fetchTokenReturnType, FETCH_TOKEN_METHOD_NAME);

        getMethodSpecBuilder.addStatement("$T headers = new $T<>()", mapStringString, HashMap.class);
        for (InferredAuthenticatedRequestHeader authHeader : authenticatedHeaders) {
            String headerName = authHeader.getHeaderName();
            String valuePrefix = authHeader.getValuePrefix().orElse(
                    headerName.equalsIgnoreCase("Authorization") ? "Bearer " : "");

            String accessorChain = buildResponsePropertyAccessor("tokenResponse", authHeader.getResponseProperty());

            if (!valuePrefix.isEmpty()) {
                getMethodSpecBuilder.addStatement(
                        "headers.put($S, $S + $L)",
                        headerName,
                        valuePrefix,
                        accessorChain);
            } else {
                getMethodSpecBuilder.addStatement(
                        "headers.put($S, $L)",
                        headerName,
                        accessorChain);
            }
        }
        getMethodSpecBuilder.addStatement("this.$L = headers", CACHED_HEADERS_FIELD_NAME);

        if (refreshRequired) {
            String expiryAccessor = buildResponsePropertyAccessor("tokenResponse", expiryProperty.get());
            getMethodSpecBuilder.addStatement(
                    "this.$L = $L($L)",
                    EXPIRES_AT_FIELD_NAME,
                    GET_EXPIRES_AT_METHOD_NAME,
                    expiryAccessor);
        }

        getMethodSpecBuilder
                .endControlFlow()
                .addStatement("return $L", CACHED_HEADERS_FIELD_NAME);

        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC);

        for (CredentialProperty prop : credentialProperties) {
            if (!prop.isLiteral()) {
                constructorBuilder.addParameter(String.class, prop.fieldName());
            }
        }

        constructorBuilder.addParameter(authClientClassName, AUTH_CLIENT_NAME);

        for (CredentialProperty prop : credentialProperties) {
            if (!prop.isLiteral()) {
                constructorBuilder.addStatement("this.$L = $L", prop.fieldName(), prop.fieldName());
            }
        }
        constructorBuilder.addStatement("this.$L = $L", AUTH_CLIENT_NAME, AUTH_CLIENT_NAME);

        if (refreshRequired) {
            constructorBuilder.addStatement("this.$L = $T.now()", EXPIRES_AT_FIELD_NAME, Instant.class);
        }

        TypeSpec.Builder typeSpecBuilder = TypeSpec.classBuilder(className)
                .addSuperinterface(supplierOfMap)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL);

        for (CredentialProperty prop : credentialProperties) {
            if (!prop.isLiteral()) {
                typeSpecBuilder.addField(
                        FieldSpec.builder(String.class, prop.fieldName(), Modifier.PRIVATE, Modifier.FINAL)
                                .build());
            }
        }

        typeSpecBuilder
                .addField(FieldSpec.builder(authClientClassName, AUTH_CLIENT_NAME, Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addField(FieldSpec.builder(mapStringString, CACHED_HEADERS_FIELD_NAME, Modifier.PRIVATE)
                        .build())
                .addMethod(constructorBuilder.build())
                .addMethod(buildFetchTokenMethod(
                        fetchTokenReturnType,
                        fetchTokenRequestType,
                        credentialProperties,
                        httpEndpoint))
                .addMethod(getMethodSpecBuilder.build());

        if (refreshRequired) {
            typeSpecBuilder
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

        JavaFile javaFile = JavaFile.builder(className.packageName(), typeSpecBuilder.build())
                .build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }

    /**
     * Collects all credential properties from the token endpoint.
     * This includes headers and body properties (both literals and user-provided).
     */
    private List<CredentialProperty> collectCredentialProperties(HttpEndpoint httpEndpoint) {
        List<CredentialProperty> properties = new ArrayList<>();

        for (HttpHeader header : httpEndpoint.getHeaders()) {
            String fieldName = header.getName().getName().getCamelCase().getUnsafeName();
            Optional<Literal> literal = extractLiteral(header.getValueType());
            boolean isOptional = isOptionalType(header.getValueType());
            properties.add(new CredentialProperty(fieldName, fieldName, literal, isOptional));
        }

        if (httpEndpoint.getRequestBody().isPresent()) {
            httpEndpoint.getRequestBody().get().visit(new com.fern.ir.model.http.HttpRequestBody.Visitor<Void>() {
                @Override
                public Void visitInlinedRequestBody(InlinedRequestBody inlinedRequestBody) {
                    for (InlinedRequestBodyProperty prop : inlinedRequestBody.getProperties()) {
                        String fieldName = prop.getName().getName().getCamelCase().getUnsafeName();
                        Optional<Literal> literal = extractLiteral(prop.getValueType());
                        boolean isOptional = isOptionalType(prop.getValueType());
                        properties.add(new CredentialProperty(fieldName, fieldName, literal, isOptional));
                    }
                    return null;
                }

                @Override
                public Void visitReference(com.fern.ir.model.http.HttpRequestBodyReference reference) {
                    // For referenced types, we would need to resolve the type
                    // For now, skip - most inferred auth uses inline bodies
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

        return properties;
    }

    /**
     * Extracts a literal value from a TypeReference if present.
     */
    private Optional<Literal> extractLiteral(TypeReference typeReference) {
        if (typeReference.isContainer()) {
            ContainerType container = typeReference.getContainer().get();
            if (container.isLiteral()) {
                return Optional.of(container.getLiteral().get());
            }
        }
        return Optional.empty();
    }

    /**
     * Checks if a TypeReference is an optional type.
     */
    private boolean isOptionalType(TypeReference typeReference) {
        if (typeReference.isContainer()) {
            ContainerType container = typeReference.getContainer().get();
            return container.isOptional();
        }
        return false;
    }

    /**
     * Builds the accessor chain to get a property from a response object.
     * For example: tokenResponse.getAccessToken() or tokenResponse.getData().getToken()
     */
    private String buildResponsePropertyAccessor(String responseVar, ResponseProperty responseProperty) {
        StringBuilder accessor = new StringBuilder(responseVar);

        if (responseProperty.getPropertyPath().isPresent()) {
            for (var pathElement : responseProperty.getPropertyPath().get()) {
                String pascalName = pathElement.getName().getPascalCase().getUnsafeName();
                accessor.append(".get").append(pascalName).append("()");
            }
        }

        String finalPropertyName = responseProperty.getProperty().getName().getName().getPascalCase().getUnsafeName();
        accessor.append(".get").append(finalPropertyName).append("()");

        return accessor.toString();
    }

    private MethodSpec buildFetchTokenMethod(
            TypeName fetchTokenReturnType,
            TypeName fetchTokenRequestType,
            List<CredentialProperty> credentialProperties,
            HttpEndpoint httpEndpoint) {

        CodeBlock.Builder requestBuilderCode = CodeBlock.builder()
                .add("$T $L = $T.builder()", fetchTokenRequestType, GET_TOKEN_REQUEST_NAME, fetchTokenRequestType);

        for (CredentialProperty prop : credentialProperties) {
            if (prop.isLiteral()) {
                String literalValue = prop.literalValue().get().visit(new Literal.Visitor<String>() {
                    @Override
                    public String visitString(String value) {
                        return "\"" + value + "\"";
                    }

                    @Override
                    public String visitBoolean(boolean value) {
                        return String.valueOf(value);
                    }

                    @Override
                    public String _visitUnknown(Object unknownType) {
                        return "null";
                    }
                });
                requestBuilderCode.add(".$L($L)", prop.builderMethodName(), literalValue);
            } else {
                requestBuilderCode.add(".$L($L)", prop.builderMethodName(), prop.fieldName());
            }
        }

        requestBuilderCode.add(".build()");

        return MethodSpec.methodBuilder(FETCH_TOKEN_METHOD_NAME)
                .addModifiers(Modifier.PRIVATE)
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
        return httpEndpoint.getSdkRequest().get().getShape().visit(new SdkRequestShape.Visitor<>() {
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

    /**
     * Represents a credential property for the token endpoint.
     */
    private static class CredentialProperty {
        private final String fieldName;
        private final String builderMethodName;
        private final Optional<Literal> literalValue;
        private final boolean isOptional;

        CredentialProperty(String fieldName, String builderMethodName, Optional<Literal> literalValue, boolean isOptional) {
            this.fieldName = fieldName;
            this.builderMethodName = builderMethodName;
            this.literalValue = literalValue;
            this.isOptional = isOptional;
        }

        public String fieldName() {
            return fieldName;
        }

        public String builderMethodName() {
            return builderMethodName;
        }

        public Optional<Literal> literalValue() {
            return literalValue;
        }

        public boolean isLiteral() {
            return literalValue.isPresent();
        }

        public boolean isOptional() {
            return isOptional;
        }
    }
}
