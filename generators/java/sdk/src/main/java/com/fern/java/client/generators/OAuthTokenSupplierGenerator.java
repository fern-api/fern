package com.fern.java.client.generators;

import com.fern.irV42.model.auth.OAuthAccessTokenRequestProperties;
import com.fern.irV42.model.auth.OAuthClientCredentials;
import com.fern.irV42.model.commons.EndpointId;
import com.fern.irV42.model.commons.EndpointReference;
import com.fern.irV42.model.http.HttpEndpoint;
import com.fern.irV42.model.http.HttpService;
import com.fern.irV42.model.http.JsonResponseBody;
import com.fern.irV42.model.http.SdkRequestBodyType;
import com.fern.irV42.model.http.SdkRequestShape.Visitor;
import com.fern.irV42.model.http.SdkRequestWrapper;
import com.fern.irV42.model.ir.Subpackage;
import com.fern.irV42.model.types.TypeReference;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.generators.visitors.RequestPropertyToNameVisitor;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.function.Supplier;
import javax.lang.model.element.Modifier;

public class OAuthTokenSupplierGenerator extends AbstractFileGenerator {

    private static final String CLIENT_ID_FIELD_NAME = "clientId";
    private static final String CLIENT_SECRET_FIELD_NAME = "clientSecret";
    private static final String ACCESS_TOKEN_FIELD_NAME = "accessToken";
    private static final String AUTH_CLIENT_NAME = "authClient";
    private static final String GET_TOKEN_REQUEST_NAME = "getTokenRequest";

    private static final String FETCH_TOKEN_METHOD_NAME = "fetchToken";
    private static final String GET_METHOD_NAME = "get";

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
        TypeName fetchTokenRequestType = getFetchTokenRequestType(httpEndpoint, httpService);
        // todo: handle other response types
        JsonResponseBody jsonResponseBody =
                httpEndpoint.getResponse().get().getJson().get().getResponse().get();
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
        TypeSpec oAuthTypeSpec = TypeSpec.classBuilder(className)
                .addSuperinterface(supplierOfString)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(FieldSpec.builder(String.class, CLIENT_ID_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addField(FieldSpec.builder(String.class, CLIENT_SECRET_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addField(FieldSpec.builder(authClientClassName, AUTH_CLIENT_NAME, Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addField(FieldSpec.builder(String.class, ACCESS_TOKEN_FIELD_NAME, Modifier.PRIVATE)
                        .build())
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(String.class, CLIENT_ID_FIELD_NAME)
                        .addParameter(String.class, CLIENT_SECRET_FIELD_NAME)
                        .addParameter(authClientClassName, AUTH_CLIENT_NAME)
                        .addStatement("this.$L = $L", CLIENT_ID_FIELD_NAME, CLIENT_ID_FIELD_NAME)
                        .addStatement("this.$L = $L", CLIENT_SECRET_FIELD_NAME, CLIENT_SECRET_FIELD_NAME)
                        .addStatement("this.$L = $L", AUTH_CLIENT_NAME, AUTH_CLIENT_NAME)
                        .build())
                .addMethod(MethodSpec.methodBuilder(FETCH_TOKEN_METHOD_NAME)
                        .addModifiers(Modifier.PUBLIC)
                        .returns(fetchTokenReturnType)
                        .addStatement(
                                "$T $L = $T.builder().$L($L).$L($L).build()",
                                fetchTokenRequestType,
                                GET_TOKEN_REQUEST_NAME,
                                fetchTokenRequestType,
                                clientIdPropertyName,
                                CLIENT_ID_FIELD_NAME,
                                clientSecretPropertyName,
                                CLIENT_SECRET_FIELD_NAME)
                        .addStatement(
                                "return $L.$L($L)",
                                AUTH_CLIENT_NAME,
                                httpEndpoint.getName().get().getCamelCase().getUnsafeName(),
                                GET_TOKEN_REQUEST_NAME)
                        .build())
                .addMethod(MethodSpec.methodBuilder(GET_METHOD_NAME)
                        .addModifiers(Modifier.PUBLIC)
                        .addAnnotation(Override.class)
                        .returns(String.class)
                        .beginControlFlow("if ($L == null)", ACCESS_TOKEN_FIELD_NAME)
                        .addStatement("$T authResponse = $L()", fetchTokenReturnType, FETCH_TOKEN_METHOD_NAME)
                        .addStatement(
                                "this.$L = authResponse.$L()",
                                ACCESS_TOKEN_FIELD_NAME,
                                "get" + accessTokenResponsePropertyName)
                        .endControlFlow()
                        .addStatement(
                                "return $S + ($L != null ? $L : $L())",
                                "Bearer ",
                                ACCESS_TOKEN_FIELD_NAME,
                                ACCESS_TOKEN_FIELD_NAME,
                                FETCH_TOKEN_METHOD_NAME)
                        .build())
                .build();
        JavaFile authHeaderFile =
                JavaFile.builder(className.packageName(), oAuthTypeSpec).build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(authHeaderFile)
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
}
