package com.fern.java.client.generators;

import com.fern.ir.model.auth.OAuthAccessTokenRequestProperties;
import com.fern.ir.model.auth.OAuthClientCredentials;
import com.fern.ir.model.commons.EndpointId;
import com.fern.ir.model.commons.EndpointReference;
import com.fern.ir.model.http.BytesRequest;
import com.fern.ir.model.http.FileUploadRequest;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpRequestBody;
import com.fern.ir.model.http.HttpRequestBodyReference;
import com.fern.ir.model.http.HttpResponseBody;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.InlinedRequestBody;
import com.fern.ir.model.http.InlinedRequestBodyProperty;
import com.fern.ir.model.http.JsonResponseBody;
import com.fern.ir.model.http.QueryParameter;
import com.fern.ir.model.http.RequestProperty;
import com.fern.ir.model.http.RequestPropertyValue;
import com.fern.ir.model.http.ResponseProperty;
import com.fern.ir.model.http.SdkRequestBodyType;
import com.fern.ir.model.http.SdkRequestShape.Visitor;
import com.fern.ir.model.http.SdkRequestWrapper;
import com.fern.ir.model.ir.Subpackage;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.EnumTypeDeclaration;
import com.fern.ir.model.types.EnumValue;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.generators.endpoint.PaginationPathUtils;
import com.fern.java.client.generators.visitors.RequestPropertyToNameVisitor;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.utils.NameUtils;
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
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;
import javax.lang.model.element.Modifier;

public class OAuthTokenSupplierGenerator extends AbstractFileGenerator {

    private static final String CLIENT_ID_FIELD_NAME = "clientId";
    private static final String CLIENT_SECRET_FIELD_NAME = "clientSecret";
    private static final String ACCESS_TOKEN_FIELD_NAME = "accessToken";
    private static final String AUTH_CLIENT_NAME = "authClient";
    private static final String GET_TOKEN_REQUEST_NAME = "getTokenRequest";
    private static final String EXPIRES_AT_FIELD_NAME = "expiresAt";
    private static final String TOKEN_LOCK_FIELD_NAME = "tokenLock";
    private static final String BUFFER_IN_MINUTES_CONSTANT_NAME = "BUFFER_IN_MINUTES";
    private static final String EXPIRES_IN_SECONDS_PARAMETER_NAME = "expiresInSeconds";

    private static final String GRANT_TYPE_WIRE_VALUE = "grant_type";
    private static final String CLIENT_CREDENTIALS_GRANT_TYPE = "client_credentials";

    private static final String FETCH_TOKEN_METHOD_NAME = "fetchToken";
    private static final String GET_METHOD_NAME = "get";
    private static final String GET_EXPIRES_AT_METHOD_NAME = "getExpiresAt";
    private static final long DEFAULT_EXPIRES_IN_SECONDS = 3600; // 1 hour

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
        String clientIdPropertyName = NameUtils.toName(requestProperties
                        .getClientId()
                        .getProperty()
                        .visit(new RequestPropertyToNameVisitor())
                        .getName())
                .getCamelCase()
                .getSafeName();
        String clientSecretPropertyName = NameUtils.toName(requestProperties
                        .getClientSecret()
                        .getProperty()
                        .visit(new RequestPropertyToNameVisitor())
                        .getName())
                .getCamelCase()
                .getSafeName();

        List<OAuthTokenSupplierProperty> customPropertiesWithNames =
                computeCustomProperties(clientGeneratorContext, clientCredentials);

        TypeName fetchTokenRequestType = getFetchTokenRequestType(httpEndpoint, httpService);
        // todo: handle other response types
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
        ResponseProperty accessTokenResponseProperty =
                clientCredentials.getTokenEndpoint().getResponseProperties().getAccessToken();
        String accessTokenResponsePropertyName = NameUtils.getName(
                        accessTokenResponseProperty.getProperty().getName())
                .getPascalCase()
                .getUnsafeName();
        boolean isAccessTokenOptional =
                isOptionalType(accessTokenResponseProperty.getProperty().getValueType());
        ParameterizedTypeName supplierOfString =
                ParameterizedTypeName.get(ClassName.get(Supplier.class), ClassName.get(String.class));
        Optional<ResponseProperty> expiryResponseProperty =
                clientCredentials.getTokenEndpoint().getResponseProperties().getExpiresIn();
        boolean refreshRequired = expiryResponseProperty.isPresent();
        Optional<String> tokenPrefix = getTokenPrefixWithSpace(clientCredentials);
        // This supplier is a singleton shared across all request threads (registered via
        // builder.addHeader), so accessToken/expiresAt are volatile and refreshed under tokenLock.
        // A cache hit takes the lock-free fast path (a volatile snapshot read); only an expired or
        // absent token enters the synchronized block, where a double-check ensures exactly one thread
        // performs the token request (single-flight). Fields are written only after fetchToken()
        // returns, so a failed refresh leaves any prior token intact.
        CodeBlock refreshNeededPredicate = refreshRequired
                ? CodeBlock.builder()
                        .add(
                                "if ($L == null || $L.isBefore($T.now()))",
                                ACCESS_TOKEN_FIELD_NAME,
                                EXPIRES_AT_FIELD_NAME,
                                Instant.class)
                        .build()
                : CodeBlock.builder()
                        .add("if ($L == null)", ACCESS_TOKEN_FIELD_NAME)
                        .build();
        MethodSpec.Builder getMethodSpecBuilder = MethodSpec.methodBuilder(GET_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(ClassName.get("", "java.lang.Override"))
                .returns(String.class)
                .addStatement("$T cachedToken = this.$L", String.class, ACCESS_TOKEN_FIELD_NAME);
        if (refreshRequired) {
            getMethodSpecBuilder
                    .addStatement("$T cachedExpiresAt = this.$L", Instant.class, EXPIRES_AT_FIELD_NAME)
                    .beginControlFlow(
                            "if (cachedToken != null && cachedExpiresAt != null && !cachedExpiresAt.isBefore($T.now()))",
                            Instant.class);
        } else {
            getMethodSpecBuilder.beginControlFlow("if (cachedToken != null)");
        }
        if (tokenPrefix.isEmpty()) {
            getMethodSpecBuilder.addStatement("return cachedToken");
        } else {
            getMethodSpecBuilder.addStatement("return $S + cachedToken", tokenPrefix.get());
        }
        getMethodSpecBuilder
                .endControlFlow()
                .beginControlFlow("synchronized ($L)", TOKEN_LOCK_FIELD_NAME)
                .beginControlFlow(refreshNeededPredicate)
                .addStatement("$T authResponse = $L()", fetchTokenReturnType, FETCH_TOKEN_METHOD_NAME);

        if (isAccessTokenOptional) {
            getMethodSpecBuilder.addStatement(
                    "this.$L = authResponse.get$L().orElseThrow(() -> new $T($S))",
                    ACCESS_TOKEN_FIELD_NAME,
                    accessTokenResponsePropertyName,
                    RuntimeException.class,
                    "Access token not present in OAuth response");
        } else {
            getMethodSpecBuilder.addStatement(
                    "this.$L = authResponse.get$L()", ACCESS_TOKEN_FIELD_NAME, accessTokenResponsePropertyName);
        }
        if (refreshRequired) {
            ResponseProperty expiresInProperty = expiryResponseProperty.get();
            String tokenPropertyName = NameUtils.getName(
                            expiresInProperty.getProperty().getName())
                    .getPascalCase()
                    .getUnsafeName();
            TypeReference expiresInType = expiresInProperty.getProperty().getValueType();
            boolean isOptional = isOptionalType(expiresInType);
            if (isOptional) {
                // Optional expires_in needs .orElse(default) unwrapping.
                // Use Long literal (e.g. 3600L) when the inner type is long/uint64
                var optionalInnerType =
                        expiresInType.getContainer().get().getOptional().get();
                boolean isInnerTypeLong = isLongType(optionalInnerType);
                getMethodSpecBuilder.addStatement(
                        "this.$L = $L(authResponse.get$L().orElse($L))",
                        EXPIRES_AT_FIELD_NAME,
                        GET_EXPIRES_AT_METHOD_NAME,
                        tokenPropertyName,
                        isInnerTypeLong ? DEFAULT_EXPIRES_IN_SECONDS + "L" : DEFAULT_EXPIRES_IN_SECONDS);
            } else {
                getMethodSpecBuilder.addStatement(
                        "this.$L = $L(authResponse.get$L())",
                        EXPIRES_AT_FIELD_NAME,
                        GET_EXPIRES_AT_METHOD_NAME,
                        tokenPropertyName);
            }
        }
        getMethodSpecBuilder.endControlFlow();
        if (tokenPrefix.isEmpty()) {
            getMethodSpecBuilder.addStatement("return $L", ACCESS_TOKEN_FIELD_NAME);
        } else {
            getMethodSpecBuilder.addStatement("return $S + $L", tokenPrefix.get(), ACCESS_TOKEN_FIELD_NAME);
        }
        getMethodSpecBuilder.endControlFlow();
        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(String.class, CLIENT_ID_FIELD_NAME)
                .addParameter(String.class, CLIENT_SECRET_FIELD_NAME);

        for (OAuthTokenSupplierProperty customProp : customPropertiesWithNames) {
            if (customProp.isHardcoded()) {
                continue;
            }
            constructorBuilder.addParameter(customProp.type, customProp.name);
        }

        constructorBuilder
                .addParameter(authClientClassName, AUTH_CLIENT_NAME)
                .addStatement("this.$L = $L", CLIENT_ID_FIELD_NAME, CLIENT_ID_FIELD_NAME)
                .addStatement("this.$L = $L", CLIENT_SECRET_FIELD_NAME, CLIENT_SECRET_FIELD_NAME);

        for (OAuthTokenSupplierProperty customProp : customPropertiesWithNames) {
            if (customProp.isHardcoded()) {
                continue;
            }
            constructorBuilder.addStatement("this.$L = $L", customProp.name, customProp.name);
        }

        constructorBuilder.addStatement("this.$L = $L", AUTH_CLIENT_NAME, AUTH_CLIENT_NAME);

        if (refreshRequired) {
            constructorBuilder.addStatement("this.$L = $T.now()", EXPIRES_AT_FIELD_NAME, Instant.class);
        }
        Builder oauthTypeSpecBuilder = TypeSpec.classBuilder(className)
                .addSuperinterface(supplierOfString)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(FieldSpec.builder(String.class, CLIENT_ID_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addField(FieldSpec.builder(String.class, CLIENT_SECRET_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                        .build());

        for (OAuthTokenSupplierProperty customProp : customPropertiesWithNames) {
            if (customProp.isHardcoded()) {
                continue;
            }
            oauthTypeSpecBuilder.addField(
                    FieldSpec.builder(customProp.type, customProp.name, Modifier.PRIVATE, Modifier.FINAL)
                            .build());
        }

        oauthTypeSpecBuilder
                .addField(FieldSpec.builder(authClientClassName, AUTH_CLIENT_NAME, Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addField(FieldSpec.builder(Object.class, TOKEN_LOCK_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                        .initializer("new $T()", Object.class)
                        .build())
                .addField(FieldSpec.builder(String.class, ACCESS_TOKEN_FIELD_NAME, Modifier.PRIVATE, Modifier.VOLATILE)
                        .build())
                .addMethod(constructorBuilder.build())
                .addMethod(buildFetchTokenMethod(
                        fetchTokenReturnType,
                        fetchTokenRequestType,
                        requestProperties,
                        clientIdPropertyName,
                        clientSecretPropertyName,
                        customPropertiesWithNames,
                        httpEndpoint))
                .addMethod(getMethodSpecBuilder.build());
        if (refreshRequired) {
            oauthTypeSpecBuilder
                    .addField(
                            FieldSpec.builder(Instant.class, EXPIRES_AT_FIELD_NAME, Modifier.PRIVATE, Modifier.VOLATILE)
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

    private MethodSpec buildFetchTokenMethod(
            TypeName fetchTokenReturnType,
            TypeName fetchTokenRequestType,
            OAuthAccessTokenRequestProperties requestProperties,
            String clientIdPropertyName,
            String clientSecretPropertyName,
            List<OAuthTokenSupplierProperty> customPropertiesWithNames,
            HttpEndpoint httpEndpoint) {
        List<BuilderSetter> setters = new ArrayList<>();
        setters.add(new BuilderSetter(
                clientIdPropertyName,
                CodeBlock.of("$L", CLIENT_ID_FIELD_NAME),
                getWireValue(requestProperties.getClientId()),
                isRequiredProperty(getValueType(requestProperties.getClientId()))));
        setters.add(new BuilderSetter(
                clientSecretPropertyName,
                CodeBlock.of("$L", CLIENT_SECRET_FIELD_NAME),
                getWireValue(requestProperties.getClientSecret()),
                isRequiredProperty(getValueType(requestProperties.getClientSecret()))));
        for (OAuthTokenSupplierProperty customProp : customPropertiesWithNames) {
            setters.add(new BuilderSetter(
                    customProp.name,
                    customProp.isHardcoded() ? customProp.hardcodedValue : CodeBlock.of("$L", customProp.name),
                    customProp.wireValue,
                    customProp.required));
        }

        // A staged builder gives every required property its own stage, in the order the request
        // object declares them, and only exposes the optional setters on the final stage. So the
        // required setters are written first, ordered by declaration, and the optional ones after.
        Map<String, Integer> declarationOrder = requestBodyPropertyOrder(httpEndpoint);
        List<BuilderSetter> requiredSetters = new ArrayList<>();
        List<BuilderSetter> optionalSetters = new ArrayList<>();
        for (BuilderSetter setter : setters) {
            (setter.required ? requiredSetters : optionalSetters).add(setter);
        }
        if (requiredSetters.stream().allMatch(setter -> declarationOrder.containsKey(setter.wireValue))) {
            requiredSetters.sort(Comparator.comparingInt(setter -> declarationOrder.get(setter.wireValue)));
        }

        CodeBlock.Builder requestBuilderCode = CodeBlock.builder()
                .add("$T $L = $T.builder()", fetchTokenRequestType, GET_TOKEN_REQUEST_NAME, fetchTokenRequestType);
        for (BuilderSetter setter : requiredSetters) {
            requestBuilderCode.add(".$L($L)", setter.methodName, setter.value);
        }
        for (BuilderSetter setter : optionalSetters) {
            requestBuilderCode.add(".$L($L)", setter.methodName, setter.value);
        }

        requestBuilderCode.add(".build()");

        return MethodSpec.methodBuilder(FETCH_TOKEN_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .returns(fetchTokenReturnType)
                .addStatement(requestBuilderCode.build())
                .addStatement(
                        "return $L.$L($L)",
                        AUTH_CLIENT_NAME,
                        NameUtils.toName(httpEndpoint.getName().get())
                                .getCamelCase()
                                .getUnsafeName(),
                        GET_TOKEN_REQUEST_NAME)
                .build();
    }

    /**
     * Maps each token request body property's wire value to its position in the generated request class, which is the
     * order the staged builder expects the required properties to be set in. Empty when the request body is neither an
     * object reference nor an inlined body (e.g. file upload or bytes, which have no builder).
     */
    private Map<String, Integer> requestBodyPropertyOrder(HttpEndpoint httpEndpoint) {
        Map<String, Integer> order = new HashMap<>();
        if (httpEndpoint.getRequestBody().isEmpty()) {
            return order;
        }
        httpEndpoint.getRequestBody().get().visit(new HttpRequestBody.Visitor<Void>() {
            @Override
            public Void visitInlinedRequestBody(InlinedRequestBody inlinedRequestBody) {
                inlinedRequestBody.getExtendedProperties().stream()
                        .flatMap(List::stream)
                        .forEach(property ->
                                order.putIfAbsent(NameUtils.getWireValue(property.getName()), order.size()));
                for (InlinedRequestBodyProperty property : inlinedRequestBody.getProperties()) {
                    order.putIfAbsent(NameUtils.getWireValue(property.getName()), order.size());
                }
                return null;
            }

            @Override
            public Void visitReference(HttpRequestBodyReference reference) {
                reference
                        .getRequestBodyType()
                        .visit(new PaginationPathUtils.TypeReferenceResolver(clientGeneratorContext))
                        .map(TypeDeclaration::getShape)
                        .flatMap(shape -> shape.getObject())
                        .ifPresent(objectDeclaration -> {
                            for (ObjectProperty property : resolvedObjectProperties(objectDeclaration)) {
                                order.putIfAbsent(NameUtils.getWireValue(property.getName()), order.size());
                            }
                        });
                return null;
            }

            @Override
            public Void visitFileUpload(FileUploadRequest fileUpload) {
                return null;
            }

            @Override
            public Void visitBytes(BytesRequest bytes) {
                return null;
            }

            @Override
            public Void _visitUnknown(Object unknownType) {
                return null;
            }
        });
        return order;
    }

    /**
     * Returns the object's extended (inherited) properties followed by its own properties, matching the order in which
     * the model generator stages them in the builder.
     */
    private static List<ObjectProperty> resolvedObjectProperties(ObjectTypeDeclaration objectDeclaration) {
        List<ObjectProperty> resolved = new ArrayList<>();
        objectDeclaration.getExtendedProperties().stream().flatMap(List::stream).forEach(resolved::add);
        resolved.addAll(objectDeclaration.getProperties());
        return resolved;
    }

    private static String getWireValue(RequestProperty requestProperty) {
        return requestProperty
                .getProperty()
                .visit(new RequestPropertyToNameVisitor())
                .getWireValue();
    }

    private static TypeReference unwrapOptional(TypeReference typeReference) {
        if (typeReference.isContainer()) {
            ContainerType container = typeReference.getContainer().get();
            if (container.isOptional()) {
                return unwrapOptional(container.getOptional().get());
            }
            if (container.isNullable()) {
                return unwrapOptional(container.getNullable().get());
            }
        }
        return typeReference;
    }

    /**
     * A property is required (and therefore gets its own builder stage) unless the model generator maps it to a type
     * that defaults to empty: an optional, a nullable, or a collection.
     */
    private static boolean isRequiredProperty(TypeReference valueType) {
        if (valueType == null || !valueType.isContainer()) {
            return valueType != null;
        }
        ContainerType container = valueType.getContainer().get();
        return !container.isOptional()
                && !container.isNullable()
                && !container.isList()
                && !container.isSet()
                && !container.isMap()
                && !container.isLiteral();
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

    private boolean isOptionalType(TypeReference typeReference) {
        if (typeReference.isContainer()) {
            return typeReference.getContainer().get().isOptional();
        }
        return false;
    }

    private boolean isLongType(TypeReference typeReference) {
        // Use the existing type mapper to resolve the IR type to Java TypeName
        TypeName resolvedTypeName =
                clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, typeReference);

        TypeName typeToCheck = resolvedTypeName;

        // If it's a ParameterizedTypeName (like Optional<Long>), extract the inner type
        if (resolvedTypeName instanceof ParameterizedTypeName) {
            ParameterizedTypeName parameterizedType = (ParameterizedTypeName) resolvedTypeName;
            // If it's Optional<T>, get the T
            if (parameterizedType.rawType.equals(ClassName.get("java.util", "Optional"))) {
                if (!parameterizedType.typeArguments.isEmpty()) {
                    typeToCheck = parameterizedType.typeArguments.get(0);
                }
            }
        }

        // Check if the type (or inner type) is Long (wrapper class) or long (primitive)
        String typeString = typeToCheck.toString();
        return typeString.equals("java.lang.Long") || typeString.equals("Long") || typeString.equals("long");
    }

    public static String getTokenHeader(OAuthClientCredentials clientCredentials) {
        return getTokenHeader(clientCredentials.getTokenHeader());
    }

    static String getTokenHeader(Optional<String> tokenHeader) {
        return tokenHeader.orElse("Authorization");
    }

    public static Optional<String> getTokenPrefixWithSpace(OAuthClientCredentials clientCredentials) {
        return getTokenPrefixWithSpace(clientCredentials.getTokenPrefix());
    }

    static Optional<String> getTokenPrefixWithSpace(Optional<String> configuredTokenPrefix) {
        String tokenPrefix = configuredTokenPrefix.orElse("Bearer");
        return tokenPrefix.isEmpty() ? Optional.empty() : Optional.of(tokenPrefix + " ");
    }

    /**
     * Computes the ordered list of custom token-request properties that become extra constructor parameters on the
     * generated {@code OAuthTokenSupplier} (inserted after clientId/clientSecret and before authClient). Shared with
     * {@code OAuthAuthProviderGenerator} so the two never drift — the auth provider must pass a matching argument for
     * each of these when it builds a token supplier.
     */
    public static List<OAuthTokenSupplierProperty> computeCustomProperties(
            ClientGeneratorContext clientGeneratorContext, OAuthClientCredentials clientCredentials) {
        EndpointReference tokenEndpointReference =
                clientCredentials.getTokenEndpoint().getEndpointReference();
        HttpService httpService =
                clientGeneratorContext.getIr().getServices().get(tokenEndpointReference.getServiceId());
        EndpointId endpointId = tokenEndpointReference.getEndpointId();
        HttpEndpoint httpEndpoint = httpService.getEndpoints().stream()
                .filter(it -> it.getId().equals(endpointId))
                .findFirst()
                .orElseThrow();
        OAuthAccessTokenRequestProperties requestProperties =
                clientCredentials.getTokenEndpoint().getRequestProperties();

        List<OAuthTokenSupplierProperty> customPropertiesWithNames = new ArrayList<>();
        // The scopes request property (if mapped) is a required property on the token request and
        // must be set on the staged builder, ordered before the remaining custom properties.
        if (requestProperties.getScopes().isPresent()
                && !isLiteralProperty(requestProperties.getScopes().get())) {
            String scopesPropName = NameUtils.toName(requestProperties
                            .getScopes()
                            .get()
                            .getProperty()
                            .visit(new RequestPropertyToNameVisitor())
                            .getName())
                    .getCamelCase()
                    .getSafeName();
            customPropertiesWithNames.add(new OAuthTokenSupplierProperty(
                    scopesPropName,
                    getPropertyTypeName(
                            clientGeneratorContext,
                            requestProperties.getScopes().get()),
                    getWireValue(requestProperties.getScopes().get()),
                    isRequiredProperty(
                            getValueType(requestProperties.getScopes().get()))));
        }
        if (requestProperties.getCustomProperties().isPresent()) {
            for (RequestProperty customProp :
                    requestProperties.getCustomProperties().get()) {
                // Skip literal properties - they are hardcoded in the request class
                if (isLiteralProperty(customProp)) {
                    continue;
                }
                String propName = NameUtils.toName(customProp
                                .getProperty()
                                .visit(new RequestPropertyToNameVisitor())
                                .getName())
                        .getCamelCase()
                        .getSafeName();
                // A non-literal grant_type property is always sent with the
                // "client_credentials" value rather than surfaced as a
                // user-supplied option: the client credentials flow requires
                // grant_type=client_credentials (RFC 6749 §4.4.2).
                if (isGrantTypeProperty(customProp)) {
                    customPropertiesWithNames.add(new OAuthTokenSupplierProperty(
                            propName,
                            getPropertyTypeName(clientGeneratorContext, customProp),
                            getWireValue(customProp),
                            isRequiredProperty(getValueType(customProp)),
                            hardcodedValue(clientGeneratorContext, customProp, CLIENT_CREDENTIALS_GRANT_TYPE)));
                    continue;
                }
                customPropertiesWithNames.add(new OAuthTokenSupplierProperty(
                        propName,
                        getPropertyTypeName(clientGeneratorContext, customProp),
                        getWireValue(customProp),
                        isRequiredProperty(getValueType(customProp))));
            }
        }

        for (var header : httpEndpoint.getHeaders()) {
            String headerName =
                    NameUtils.getName(header.getName()).getCamelCase().getSafeName();
            TypeName headerType =
                    clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(false, header.getValueType());
            customPropertiesWithNames.add(new OAuthTokenSupplierProperty(
                    headerName,
                    headerType,
                    NameUtils.getWireValue(header.getName()),
                    isRequiredProperty(header.getValueType())));
        }
        return customPropertiesWithNames;
    }

    private static TypeName getPropertyTypeName(
            ClientGeneratorContext clientGeneratorContext, RequestProperty requestProperty) {
        return clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(false, getValueType(requestProperty));
    }

    private static TypeReference getValueType(RequestProperty requestProperty) {
        return requestProperty.getProperty().visit(new RequestPropertyValue.Visitor<TypeReference>() {
            @Override
            public TypeReference visitQuery(QueryParameter query) {
                return query.getValueType();
            }

            @Override
            public TypeReference visitBody(ObjectProperty body) {
                return body.getValueType();
            }

            @Override
            public TypeReference _visitUnknown(Object unknownType) {
                return null;
            }
        });
    }

    /**
     * Builds the expression for a property the supplier always sends with a fixed wire value (e.g. grant_type). Enum
     * properties take the matching enum constant; everything else takes a string literal.
     */
    private static CodeBlock hardcodedValue(
            ClientGeneratorContext clientGeneratorContext, RequestProperty requestProperty, String wireValue) {
        TypeReference valueType = getValueType(requestProperty);
        if (valueType != null) {
            Optional<TypeDeclaration> declaration =
                    valueType.visit(new PaginationPathUtils.TypeReferenceResolver(clientGeneratorContext));
            Optional<EnumTypeDeclaration> enumDeclaration =
                    declaration.map(TypeDeclaration::getShape).flatMap(shape -> shape.getEnum());
            if (enumDeclaration.isPresent()) {
                for (EnumValue enumValue : enumDeclaration.get().getValues()) {
                    if (wireValue.equals(NameUtils.getWireValue(enumValue.getName()))) {
                        return CodeBlock.of(
                                "$T.$L",
                                clientGeneratorContext
                                        .getPoetTypeNameMapper()
                                        .convertToTypeName(false, unwrapOptional(valueType)),
                                NameUtils.getName(enumValue.getName())
                                        .getScreamingSnakeCase()
                                        .getSafeName());
                    }
                }
            }
        }
        return CodeBlock.of("$S", wireValue);
    }

    /** A single setter written on the token request builder, with the value it is called with. */
    private static final class BuilderSetter {
        private final String methodName;
        private final CodeBlock value;
        private final String wireValue;
        private final boolean required;

        private BuilderSetter(String methodName, CodeBlock value, String wireValue, boolean required) {
            this.methodName = methodName;
            this.value = value;
            this.wireValue = wireValue;
            this.required = required;
        }
    }

    /** A get-token request property carried through to the token supplier, with its resolved Java type. */
    public static final class OAuthTokenSupplierProperty {
        private final String name;
        private final TypeName type;
        private final String wireValue;
        private final boolean required;
        private final CodeBlock hardcodedValue;

        private OAuthTokenSupplierProperty(String name, TypeName type, String wireValue, boolean required) {
            this(name, type, wireValue, required, null);
        }

        private OAuthTokenSupplierProperty(
                String name, TypeName type, String wireValue, boolean required, CodeBlock hardcodedValue) {
            this.name = name;
            this.type = type;
            this.wireValue = wireValue;
            this.required = required;
            this.hardcodedValue = hardcodedValue;
        }

        public TypeName getType() {
            return type;
        }

        /**
         * A hardcoded property (e.g. grant_type) is written directly into the token request and is NOT a constructor
         * parameter, so it must be skipped when matching constructor arguments.
         */
        public boolean isHardcoded() {
            return hardcodedValue != null;
        }
    }

    public static boolean isGrantTypeProperty(RequestProperty requestProperty) {
        return GRANT_TYPE_WIRE_VALUE.equals(requestProperty
                .getProperty()
                .visit(new RequestPropertyToNameVisitor())
                .getWireValue());
    }

    private static boolean isLiteralProperty(RequestProperty requestProperty) {
        TypeReference valueType = requestProperty
                .getProperty()
                .visit(new RequestPropertyValue.Visitor<TypeReference>() {
                    @Override
                    public TypeReference visitQuery(QueryParameter query) {
                        return query.getValueType();
                    }

                    @Override
                    public TypeReference visitBody(ObjectProperty body) {
                        return body.getValueType();
                    }

                    @Override
                    public TypeReference _visitUnknown(Object unknownType) {
                        return null;
                    }
                });
        if (valueType == null) {
            return false;
        }
        if (valueType.isContainer()) {
            return valueType.getContainer().get().isLiteral();
        }
        return false;
    }
}
