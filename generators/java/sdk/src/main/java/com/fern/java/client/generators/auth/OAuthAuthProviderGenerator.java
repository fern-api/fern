/*
 * (c) Copyright 2023 Birch Solutions Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.fern.java.client.generators.auth;

import com.fern.ir.model.auth.OAuthClientCredentials;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;
import javax.lang.model.element.Modifier;

/**
 * Generates an OAuthAuthProvider class that implements AuthProvider for OAuth client credentials auth.
 * This provider manages token acquisition and caching with expiration handling.
 */
public final class OAuthAuthProviderGenerator extends AbstractFileGenerator {

    public static final String AUTH_SCHEME_NAME = "OAuth";

    private final OAuthClientCredentials clientCredentials;
    private final ClientGeneratorContext clientGeneratorContext;
    private final ClassName authClientClassName;

    public OAuthAuthProviderGenerator(
            ClientGeneratorContext generatorContext,
            OAuthClientCredentials clientCredentials,
            ClassName authClientClassName) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName("OAuthAuthProvider"), generatorContext);
        this.clientCredentials = clientCredentials;
        this.clientGeneratorContext = generatorContext;
        this.authClientClassName = authClientClassName;
    }

    public String getSchemeName() {
        return AUTH_SCHEME_NAME;
    }

    @Override
    public GeneratedJavaFile generateFile() {
        ClassName authProviderClassName =
                generatorContext.getPoetClassNameFactory().getCoreClassName("AuthProvider");
        ClassName endpointMetadataClassName =
                generatorContext.getPoetClassNameFactory().getCoreClassName("EndpointMetadata");
        ClassName oauthTokenSupplierClassName =
                generatorContext.getPoetClassNameFactory().getCoreClassName("OAuthTokenSupplier");

        ParameterizedTypeName stringSupplierType = ParameterizedTypeName.get(
                ClassName.get(Supplier.class), ClassName.get(String.class));

        // Fields
        FieldSpec clientIdSupplierField = FieldSpec.builder(stringSupplierType, "clientIdSupplier", Modifier.PRIVATE, Modifier.FINAL)
                .build();
        FieldSpec clientSecretSupplierField = FieldSpec.builder(stringSupplierType, "clientSecretSupplier", Modifier.PRIVATE, Modifier.FINAL)
                .build();
        FieldSpec authClientField = FieldSpec.builder(authClientClassName, "authClient", Modifier.PRIVATE, Modifier.FINAL)
                .build();
        FieldSpec accessTokenField = FieldSpec.builder(String.class, "accessToken", Modifier.PRIVATE)
                .build();
        FieldSpec expiresAtField = FieldSpec.builder(Instant.class, "expiresAt", Modifier.PRIVATE)
                .build();
        FieldSpec refreshLockField = FieldSpec.builder(Object.class, "refreshLock", Modifier.PRIVATE, Modifier.FINAL)
                .initializer("new Object()")
                .build();

        String clientIdEnvVar = clientCredentials.getClientIdEnvVar().map(ev -> ev.get()).orElse(null);
        String clientSecretEnvVar = clientCredentials.getClientSecretEnvVar().map(ev -> ev.get()).orElse(null);
        String tokenPrefix = clientCredentials.getTokenPrefix().orElse("Bearer");

        StringBuilder errorMessageBuilder = new StringBuilder("Please provide ");
        if (clientIdEnvVar != null && clientSecretEnvVar != null) {
            errorMessageBuilder.append("clientId and clientSecret via .clientId()/.clientSecret() or set ")
                    .append(clientIdEnvVar).append(" and ").append(clientSecretEnvVar).append(" environment variables");
        } else {
            errorMessageBuilder.append("clientId and clientSecret via .clientId()/.clientSecret()");
        }
        String errorMessage = errorMessageBuilder.toString();

        TypeSpec.Builder classBuilder = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addSuperinterface(authProviderClassName)
                .addJavadoc("Auth provider for OAuth client credentials authentication.\n")
                .addJavadoc("Handles token acquisition and caching with automatic refresh on expiration.\n")
                .addField(FieldSpec.builder(String.class, "AUTH_SCHEME", Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                        .initializer("$S", AUTH_SCHEME_NAME)
                        .build())
                .addField(FieldSpec.builder(String.class, "AUTH_CONFIG_ERROR_MESSAGE", Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                        .initializer("$S", errorMessage)
                        .build())
                .addField(FieldSpec.builder(long.class, "BUFFER_IN_MINUTES", Modifier.PRIVATE, Modifier.STATIC, Modifier.FINAL)
                        .initializer("2")
                        .build())
                .addField(clientIdSupplierField)
                .addField(clientSecretSupplierField)
                .addField(authClientField)
                .addField(accessTokenField)
                .addField(expiresAtField)
                .addField(refreshLockField)
                .addMethod(buildConstructor(clientIdSupplierField, clientSecretSupplierField, authClientField))
                .addMethod(buildGetAuthHeaders(endpointMetadataClassName, tokenPrefix))
                .addMethod(buildGetTokenMethod())
                .addMethod(buildRefreshMethod(oauthTokenSupplierClassName))
                .addMethod(buildGetExpiresAtMethod())
                .addMethod(buildCanCreateMethod(clientIdEnvVar, clientSecretEnvVar));

        JavaFile javaFile = JavaFile.builder(className.packageName(), classBuilder.build())
                .build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }

    private MethodSpec buildConstructor(
            FieldSpec clientIdSupplierField,
            FieldSpec clientSecretSupplierField,
            FieldSpec authClientField) {
        ParameterizedTypeName stringSupplierType = ParameterizedTypeName.get(
                ClassName.get(Supplier.class), ClassName.get(String.class));

        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(stringSupplierType, "clientIdSupplier")
                .addParameter(stringSupplierType, "clientSecretSupplier")
                .addParameter(authClientClassName, "authClient")
                .addStatement("this.$N = clientIdSupplier", clientIdSupplierField)
                .addStatement("this.$N = clientSecretSupplier", clientSecretSupplierField)
                .addStatement("this.$N = authClient", authClientField)
                .addStatement("this.expiresAt = $T.now()", Instant.class)
                .build();
    }

    private MethodSpec buildGetAuthHeaders(ClassName endpointMetadataClassName, String tokenPrefix) {
        return MethodSpec.methodBuilder("getAuthHeaders")
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Override.class)
                .addParameter(endpointMetadataClassName, "endpointMetadata")
                .returns(ParameterizedTypeName.get(Map.class, String.class, String.class))
                .addStatement("String token = getToken()")
                .addStatement("$T<String, String> headers = new $T<>()", Map.class, HashMap.class)
                .addStatement("headers.put($S, $S + token)", "Authorization", tokenPrefix + " ")
                .addStatement("return headers")
                .build();
    }

    private MethodSpec buildGetTokenMethod() {
        return MethodSpec.methodBuilder("getToken")
                .addModifiers(Modifier.PRIVATE)
                .returns(String.class)
                .addComment("Check if we have a valid cached token")
                .beginControlFlow("if (this.accessToken != null && this.expiresAt.isAfter($T.now()))", Instant.class)
                .addStatement("return this.accessToken")
                .endControlFlow()
                .addComment("Need to refresh - synchronize to prevent concurrent refreshes")
                .beginControlFlow("synchronized (refreshLock)")
                .addComment("Double-check after acquiring lock")
                .beginControlFlow("if (this.accessToken != null && this.expiresAt.isAfter($T.now()))", Instant.class)
                .addStatement("return this.accessToken")
                .endControlFlow()
                .addStatement("return refresh()")
                .endControlFlow()
                .build();
    }

    private MethodSpec buildRefreshMethod(ClassName oauthTokenSupplierClassName) {
        // Get the token response type - we'll use the OAuthTokenSupplier pattern
        // The refresh method calls the token endpoint and updates cached values
        return MethodSpec.methodBuilder("refresh")
                .addModifiers(Modifier.PRIVATE)
                .returns(String.class)
                .addStatement("String clientId = this.clientIdSupplier.get()")
                .addStatement("String clientSecret = this.clientSecretSupplier.get()")
                .beginControlFlow("if (clientId == null || clientSecret == null)")
                .addStatement("throw new $T(AUTH_CONFIG_ERROR_MESSAGE)", RuntimeException.class)
                .endControlFlow()
                .addComment("Create a temporary token supplier to fetch the token")
                .addStatement(
                        "$T tokenSupplier = new $T(clientId, clientSecret, this.authClient)",
                        oauthTokenSupplierClassName,
                        oauthTokenSupplierClassName)
                .addComment("The token supplier's get() method handles fetching and returns the full auth header value")
                .addStatement("String authHeader = tokenSupplier.get()")
                .addComment("Extract just the token part (remove 'Bearer ' prefix)")
                .beginControlFlow("if (authHeader.startsWith($S))", "Bearer ")
                .addStatement("this.accessToken = authHeader.substring(7)")
                .nextControlFlow("else")
                .addStatement("this.accessToken = authHeader")
                .endControlFlow()
                .addComment("Set expiration with buffer (we don't have access to expires_in here, so use 1 hour default)")
                .addStatement("this.expiresAt = getExpiresAt(3600)")
                .addStatement("return this.accessToken")
                .build();
    }

    private MethodSpec buildGetExpiresAtMethod() {
        return MethodSpec.methodBuilder("getExpiresAt")
                .addModifiers(Modifier.PRIVATE)
                .addParameter(long.class, "expiresInSeconds")
                .returns(Instant.class)
                .addStatement(
                        "return $T.now().plus(expiresInSeconds, $T.SECONDS).minus(BUFFER_IN_MINUTES, $T.MINUTES)",
                        Instant.class,
                        ChronoUnit.class,
                        ChronoUnit.class)
                .build();
    }

    private MethodSpec buildCanCreateMethod(String clientIdEnvVar, String clientSecretEnvVar) {
        ParameterizedTypeName stringSupplierType = ParameterizedTypeName.get(
                ClassName.get(Supplier.class), ClassName.get(String.class));

        MethodSpec.Builder builder = MethodSpec.methodBuilder("canCreate")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addJavadoc("Checks if this provider can be created with the given suppliers.\n")
                .addParameter(stringSupplierType, "clientIdSupplier")
                .addParameter(stringSupplierType, "clientSecretSupplier")
                .returns(boolean.class);

        StringBuilder clientIdCheck = new StringBuilder("clientIdSupplier != null");
        StringBuilder clientSecretCheck = new StringBuilder("clientSecretSupplier != null");

        if (clientIdEnvVar != null) {
            clientIdCheck.append(" || System.getenv(\"").append(clientIdEnvVar).append("\") != null");
        }
        if (clientSecretEnvVar != null) {
            clientSecretCheck.append(" || System.getenv(\"").append(clientSecretEnvVar).append("\") != null");
        }

        builder.addStatement("return (" + clientIdCheck + ") && (" + clientSecretCheck + ")");

        return builder.build();
    }
}
