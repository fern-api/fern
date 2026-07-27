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
import com.fern.ir.model.http.JsonResponseBody;
import com.fern.ir.model.http.QueryParameter;
import com.fern.ir.model.http.RequestProperty;
import com.fern.ir.model.http.RequestPropertyValue;
import com.fern.ir.model.http.ResponseProperty;
import com.fern.ir.model.http.SdkRequestBodyType;
import com.fern.ir.model.http.SdkRequestShape.Visitor;
import com.fern.ir.model.http.SdkRequestWrapper;
import com.fern.ir.model.ir.Subpackage;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.RequestBodyUtils;
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
import java.util.List;
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
        String clientIdWireValue = requestProperties
                .getClientId()
                .getProperty()
                .visit(new RequestPropertyToNameVisitor())
                .getWireValue();
        String clientSecretWireValue = requestProperties
                .getClientSecret()
                .getProperty()
                .visit(new RequestPropertyToNameVisitor())
                .getWireValue();

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
        String tokenPrefixWithSpace = clientCredentials.getTokenPrefix().orElse("Bearer") + " ";
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
        getMethodSpecBuilder
                .addStatement("return $S + cachedToken", tokenPrefixWithSpace)
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
        getMethodSpecBuilder
                .endControlFlow()
                .addStatement("return $S + $L", tokenPrefixWithSpace, ACCESS_TOKEN_FIELD_NAME)
                .endControlFlow();
        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(String.class, CLIENT_ID_FIELD_NAME)
                .addParameter(String.class, CLIENT_SECRET_FIELD_NAME);

        for (OAuthTokenSupplierProperty customProp : customPropertiesWithNames) {
            if (customProp.hardcodedStringValue != null) {
                continue;
            }
            constructorBuilder.addParameter(customProp.type, customProp.name);
        }

        constructorBuilder
                .addParameter(authClientClassName, AUTH_CLIENT_NAME)
                .addStatement("this.$L = $L", CLIENT_ID_FIELD_NAME, CLIENT_ID_FIELD_NAME)
                .addStatement("this.$L = $L", CLIENT_SECRET_FIELD_NAME, CLIENT_SECRET_FIELD_NAME);

        for (OAuthTokenSupplierProperty customProp : customPropertiesWithNames) {
            if (customProp.hardcodedStringValue != null) {
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
            if (customProp.hardcodedStringValue != null) {
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
                        clientIdPropertyName,
                        clientSecretPropertyName,
                        clientIdWireValue,
                        clientSecretWireValue,
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
            String clientIdPropertyName,
            String clientSecretPropertyName,
            String clientIdWireValue,
            String clientSecretWireValue,
            List<OAuthTokenSupplierProperty> customPropertiesWithNames,
            HttpEndpoint httpEndpoint) {
        // Collect every builder setter the supplier needs to call, tagged with the token-request
        // property's wire value so we can order them to match the generated request type's builder.
        List<BuilderSetter> setters = new ArrayList<>();
        setters.add(BuilderSetter.reference(clientIdWireValue, clientIdPropertyName, CLIENT_ID_FIELD_NAME));
        setters.add(BuilderSetter.reference(clientSecretWireValue, clientSecretPropertyName, CLIENT_SECRET_FIELD_NAME));
        for (OAuthTokenSupplierProperty customProp : customPropertiesWithNames) {
            if (customProp.hardcodedStringValue != null) {
                setters.add(
                        BuilderSetter.literal(customProp.wireValue, customProp.name, customProp.hardcodedStringValue));
                continue;
            }
            setters.add(BuilderSetter.reference(customProp.wireValue, customProp.name, customProp.name));
        }

        // When the token-request type has a required field, Java codegen (BuilderGenerator) emits a
        // staged builder: builder() -> <firstRequired>Stage -> ... -> _FinalStage. Each required stage
        // exposes ONLY its own setter, so the supplier must call the required setters first, in the
        // request-type property declaration order, before any optional setter. Otherwise javac fails
        // with "cannot find symbol" on the setter that isn't available on the current stage.
        List<String> requiredWireValuesInOrder = getRequiredBuilderPropertyWireValuesInOrder(httpEndpoint);

        List<BuilderSetter> orderedSetters = orderSettersForBuilder(setters, requiredWireValuesInOrder);

        CodeBlock.Builder requestBuilderCode = CodeBlock.builder()
                .add("$T $L = $T.builder()", fetchTokenRequestType, GET_TOKEN_REQUEST_NAME, fetchTokenRequestType);
        for (BuilderSetter setter : orderedSetters) {
            if (setter.isLiteral) {
                requestBuilderCode.add(".$L($S)", setter.methodName, setter.argument);
            } else {
                requestBuilderCode.add(".$L($L)", setter.methodName, setter.argument);
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
                        NameUtils.toName(httpEndpoint.getName().get())
                                .getCamelCase()
                                .getUnsafeName(),
                        GET_TOKEN_REQUEST_NAME)
                .build();
    }

    /**
     * Orders the token-request builder setters to match the staged builder emitted by {@code BuilderGenerator}:
     * required-field setters first, in the request-type property declaration order, then the remaining (optional)
     * setters in their original order. When the request type has no required field the builder is unstaged and every
     * setter is available immediately, so the original order is preserved (keeping output byte-identical for those
     * cases). Setters whose wire value is unknown are treated as optional and kept in place.
     */
    private static List<BuilderSetter> orderSettersForBuilder(
            List<BuilderSetter> setters, List<String> requiredWireValuesInOrder) {
        if (requiredWireValuesInOrder.isEmpty()) {
            return setters;
        }
        List<BuilderSetter> required = new ArrayList<>();
        for (String wireValue : requiredWireValuesInOrder) {
            for (BuilderSetter setter : setters) {
                if (wireValue.equals(setter.wireValue)) {
                    required.add(setter);
                }
            }
        }
        List<BuilderSetter> ordered = new ArrayList<>(required);
        for (BuilderSetter setter : setters) {
            if (!required.contains(setter)) {
                ordered.add(setter);
            }
        }
        return ordered;
    }

    /**
     * Returns the wire values of the token-request properties that {@code BuilderGenerator} turns into required builder
     * stages, in declaration order. Literal properties are skipped (they are baked into the request type and are not
     * builder setters). A property is required using the same rule as {@code BuilderGenerator.isRequired}: it is not
     * optional/nullable and not a collection (list/set/map).
     */
    private List<String> getRequiredBuilderPropertyWireValuesInOrder(HttpEndpoint httpEndpoint) {
        if (httpEndpoint.getRequestBody().isEmpty()) {
            return List.of();
        }
        List<ObjectProperty> properties = httpEndpoint
                .getRequestBody()
                .get()
                .visit(new HttpRequestBody.Visitor<List<ObjectProperty>>() {
                    @Override
                    public List<ObjectProperty> visitInlinedRequestBody(InlinedRequestBody inlinedRequestBody) {
                        List<ObjectProperty> resolved = new ArrayList<>();
                        for (var extended : inlinedRequestBody.getExtends()) {
                            resolveExtendedObjectProperties(extended, resolved);
                        }
                        resolved.addAll(RequestBodyUtils.convertToObjectProperties(inlinedRequestBody));
                        return resolved;
                    }

                    @Override
                    public List<ObjectProperty> visitReference(HttpRequestBodyReference reference) {
                        return reference
                                .getRequestBodyType()
                                .visit(new PaginationPathUtils.TypeReferenceResolver(clientGeneratorContext))
                                .map(TypeDeclaration::getShape)
                                .flatMap(shape -> shape.getObject())
                                .map(OAuthTokenSupplierGenerator.this::resolveObjectProperties)
                                .orElseGet(List::of);
                    }

                    @Override
                    public List<ObjectProperty> visitFileUpload(FileUploadRequest fileUpload) {
                        return RequestBodyUtils.convertToObjectProperties(fileUpload);
                    }

                    @Override
                    public List<ObjectProperty> visitBytes(BytesRequest bytes) {
                        return List.of();
                    }

                    @Override
                    public List<ObjectProperty> _visitUnknown(Object unknownType) {
                        return List.of();
                    }
                });

        List<String> requiredWireValues = new ArrayList<>();
        for (ObjectProperty property : properties) {
            TypeReference valueType = property.getValueType();
            if (isLiteralType(valueType)) {
                continue;
            }
            if (isRequiredBuilderProperty(valueType)) {
                requiredWireValues.add(NameUtils.getWireValue(property.getName()));
            }
        }
        return requiredWireValues;
    }

    private void resolveExtendedObjectProperties(
            com.fern.ir.model.types.DeclaredTypeName extended, List<ObjectProperty> accumulator) {
        var typeDeclaration = clientGeneratorContext.getIr().getTypes().get(extended.getTypeId());
        if (typeDeclaration == null) {
            return;
        }
        typeDeclaration.getShape().getObject().ifPresent(object -> accumulator.addAll(resolveObjectProperties(object)));
    }

    private List<ObjectProperty> resolveObjectProperties(
            com.fern.ir.model.types.ObjectTypeDeclaration objectDeclaration) {
        List<ObjectProperty> resolved = new ArrayList<>();
        objectDeclaration.getExtendedProperties().stream().flatMap(List::stream).forEach(resolved::add);
        resolved.addAll(objectDeclaration.getProperties());
        return resolved;
    }

    /**
     * Mirrors {@code BuilderGenerator.isRequired}: a property yields a required builder stage unless it resolves to an
     * optional, nullable, or collection (list/set/map) type. We reuse the POET type mapper so the classification tracks
     * whatever the request type's builder actually emitted (e.g. optional&lt;T&gt; -&gt; Optional&lt;T&gt;, nullable
     * -&gt; OptionalNullable&lt;T&gt;).
     */
    private boolean isRequiredBuilderProperty(TypeReference valueType) {
        TypeName poetTypeName = clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(false, valueType);
        if (poetTypeName instanceof ParameterizedTypeName) {
            ClassName rawType = ((ParameterizedTypeName) poetTypeName).rawType;
            ClassName optionalNullableClassName =
                    clientGeneratorContext.getPoetClassNameFactory().getOptionalNullableClassName();
            return !rawType.equals(ClassName.get(Optional.class))
                    && !rawType.equals(optionalNullableClassName)
                    && !rawType.equals(ClassName.get(java.util.Map.class))
                    && !rawType.equals(ClassName.get(List.class))
                    && !rawType.equals(ClassName.get(java.util.Set.class));
        }
        return true;
    }

    private boolean isLiteralType(TypeReference valueType) {
        if (valueType != null && valueType.isContainer()) {
            return valueType.getContainer().get().isLiteral();
        }
        return false;
    }

    /** A single builder setter call the token supplier will emit, tagged with its token-request wire value. */
    private static final class BuilderSetter {
        private final String wireValue;
        private final String methodName;
        private final String argument;
        private final boolean isLiteral;

        private BuilderSetter(String wireValue, String methodName, String argument, boolean isLiteral) {
            this.wireValue = wireValue;
            this.methodName = methodName;
            this.argument = argument;
            this.isLiteral = isLiteral;
        }

        private static BuilderSetter reference(String wireValue, String methodName, String argument) {
            return new BuilderSetter(wireValue, methodName, argument, false);
        }

        private static BuilderSetter literal(String wireValue, String methodName, String literalValue) {
            return new BuilderSetter(wireValue, methodName, literalValue, true);
        }
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
            String scopesWireValue = requestProperties
                    .getScopes()
                    .get()
                    .getProperty()
                    .visit(new RequestPropertyToNameVisitor())
                    .getWireValue();
            customPropertiesWithNames.add(new OAuthTokenSupplierProperty(
                    scopesPropName,
                    getPropertyTypeName(
                            clientGeneratorContext,
                            requestProperties.getScopes().get()),
                    null,
                    scopesWireValue));
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
                String propWireValue = customProp
                        .getProperty()
                        .visit(new RequestPropertyToNameVisitor())
                        .getWireValue();
                // A non-literal grant_type property is always sent with the
                // "client_credentials" value rather than surfaced as a
                // user-supplied option: the client credentials flow requires
                // grant_type=client_credentials (RFC 6749 §4.4.2).
                if (isGrantTypeProperty(customProp)) {
                    customPropertiesWithNames.add(new OAuthTokenSupplierProperty(
                            propName,
                            getPropertyTypeName(clientGeneratorContext, customProp),
                            CLIENT_CREDENTIALS_GRANT_TYPE,
                            propWireValue));
                    continue;
                }
                customPropertiesWithNames.add(new OAuthTokenSupplierProperty(
                        propName, getPropertyTypeName(clientGeneratorContext, customProp), null, propWireValue));
            }
        }

        for (var header : httpEndpoint.getHeaders()) {
            String headerName =
                    NameUtils.getName(header.getName()).getCamelCase().getSafeName();
            String headerWireValue = NameUtils.getWireValue(header.getName());
            TypeName headerType =
                    clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(false, header.getValueType());
            customPropertiesWithNames.add(
                    new OAuthTokenSupplierProperty(headerName, headerType, null, headerWireValue));
        }
        return customPropertiesWithNames;
    }

    private static TypeName getPropertyTypeName(
            ClientGeneratorContext clientGeneratorContext, RequestProperty requestProperty) {
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
        return clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(false, valueType);
    }

    /** A get-token request property carried through to the token supplier, with its resolved Java type. */
    public static final class OAuthTokenSupplierProperty {
        private final String name;
        private final TypeName type;
        private final String hardcodedStringValue;
        private final String wireValue;

        private OAuthTokenSupplierProperty(String name, TypeName type) {
            this(name, type, null, null);
        }

        private OAuthTokenSupplierProperty(String name, TypeName type, String hardcodedStringValue) {
            this(name, type, hardcodedStringValue, null);
        }

        private OAuthTokenSupplierProperty(String name, TypeName type, String hardcodedStringValue, String wireValue) {
            this.name = name;
            this.type = type;
            this.hardcodedStringValue = hardcodedStringValue;
            this.wireValue = wireValue;
        }

        public TypeName getType() {
            return type;
        }

        /**
         * A hardcoded property (e.g. grant_type) is written directly into the token request and is NOT a constructor
         * parameter, so it must be skipped when matching constructor arguments.
         */
        public boolean isHardcoded() {
            return hardcodedStringValue != null;
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
