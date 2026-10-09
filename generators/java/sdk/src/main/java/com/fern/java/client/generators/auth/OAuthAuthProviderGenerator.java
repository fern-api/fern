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
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.generators.OAuthTokenSupplierGenerator;
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
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;
import javax.lang.model.element.Modifier;

/**
 * Generates an OAuthAuthProvider class that implements AuthProvider for OAuth client credentials auth. This provider
 * manages token acquisition and caching with expiration handling.
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

        ParameterizedTypeName stringSupplierType =
                ParameterizedTypeName.get(ClassName.get(Supplier.class), ClassName.get(String.class));

        // Fields
        FieldSpec clientIdSupplierField = FieldSpec.builder(
                        stringSupplierType, "clientIdSupplier", Modifier.PRIVATE, Modifier.FINAL)
                .build();
        FieldSpec clientSecretSupplierField = FieldSpec.builder(
                        stringSupplierType, "clientSecretSupplier", Modifier.PRIVATE, Modifier.FINAL)
                .build();
        FieldSpec authClientField = FieldSpec.builder(
                        authClientClassName, "authClient", Modifier.PRIVATE, Modifier.FINAL)
                .build();
        // accessToken/expiresAt are volatile: getToken() reads them on a lock-free fast path (outside
        // refreshLock), so the writes made under the lock in refresh() must be safely published to other
        // threads. Without volatile the double-checked locking below is the classic broken-DCL idiom.
        FieldSpec accessTokenField = FieldSpec.builder(String.class, "accessToken", Modifier.PRIVATE, Modifier.VOLATILE)
                .build();
        FieldSpec expiresAtField = FieldSpec.builder(Instant.class, "expiresAt", Modifier.PRIVATE, Modifier.VOLATILE)
                .build();
        FieldSpec refreshLockField = FieldSpec.builder(Object.class, "refreshLock", Modifier.PRIVATE, Modifier.FINAL)
                .initializer("new Object()")
                .build();

        String clientIdEnvVar =
                clientCredentials.getClientIdEnvVar().map(ev -> ev.get()).orElse(null);
        String clientSecretEnvVar =
                clientCredentials.getClientSecretEnvVar().map(ev -> ev.get()).orElse(null);
        Optional<String> tokenPrefix = OAuthTokenSupplierGenerator.getTokenPrefixWithSpace(clientCredentials);
        String tokenHeader = OAuthTokenSupplierGenerator.getTokenHeader(clientCredentials);

        StringBuilder errorMessageBuilder = new StringBuilder("Please provide ");
        if (clientIdEnvVar != null && clientSecretEnvVar != null) {
            errorMessageBuilder
                    .append("clientId and clientSecret via .clientId()/.clientSecret() or set ")
                    .append(clientIdEnvVar)
                    .append(" and ")
                    .append(clientSecretEnvVar)
                    .append(" environment variables");
        } else {
            errorMessageBuilder.append("clientId and clientSecret via .clientId()/.clientSecret()");
        }
        String errorMessage = errorMessageBuilder.toString();

        TypeSpec.Builder classBuilder = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addSuperinterface(authProviderClassName)
                .addJavadoc("Auth provider for OAuth client credentials authentication.\n")
                .addJavadoc("Handles token acquisition and caching with automatic refresh on expiration.\n")
                .addField(
                        FieldSpec.builder(String.class, "AUTH_SCHEME", Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                                .initializer("$S", AUTH_SCHEME_NAME)
                                .build())
                .addField(FieldSpec.builder(
                                String.class,
                                "AUTH_CONFIG_ERROR_MESSAGE",
                                Modifier.PUBLIC,
                                Modifier.STATIC,
                                Modifier.FINAL)
                        .initializer("$S", errorMessage)
                        .build())
                .addField(FieldSpec.builder(
                                long.class, "BUFFER_IN_MINUTES", Modifier.PRIVATE, Modifier.STATIC, Modifier.FINAL)
                        .initializer("2")
                        .build())
                .addField(clientIdSupplierField)
                .addField(clientSecretSupplierField)
                .addField(authClientField)
                .addField(accessTokenField)
                .addField(expiresAtField)
                .addField(refreshLockField)
                .addMethod(buildConstructor(clientIdSupplierField, clientSecretSupplierField, authClientField))
                .addMethod(buildGetAuthHeaders(endpointMetadataClassName, tokenHeader, tokenPrefix))
                .addMethod(buildGetTokenMethod())
                .addMethod(buildRefreshMethod(oauthTokenSupplierClassName, tokenPrefix))
                .addMethod(buildGetExpiresAtMethod())
                .addMethod(buildCanCreateMethod(clientIdEnvVar, clientSecretEnvVar));

        JavaFile javaFile =
                JavaFile.builder(className.packageName(), classBuilder.build()).build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }

    private MethodSpec buildConstructor(
            FieldSpec clientIdSupplierField, FieldSpec clientSecretSupplierField, FieldSpec authClientField) {
        ParameterizedTypeName stringSupplierType =
                ParameterizedTypeName.get(ClassName.get(Supplier.class), ClassName.get(String.class));

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

    private MethodSpec buildGetAuthHeaders(
            ClassName endpointMetadataClassName, String tokenHeader, Optional<String> tokenPrefix) {
        MethodSpec.Builder method = MethodSpec.methodBuilder("getAuthHeaders")
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Override.class)
                .addParameter(endpointMetadataClassName, "endpointMetadata")
                .returns(ParameterizedTypeName.get(Map.class, String.class, String.class))
                .addStatement("String token = getToken()")
                .addStatement("$T<String, String> headers = new $T<>()", Map.class, HashMap.class);
        if (tokenPrefix.isEmpty()) {
            method.addStatement("headers.put($S, token)", tokenHeader);
        } else {
            method.addStatement("headers.put($S, $S + token)", tokenHeader, tokenPrefix.get());
        }
        return method.addStatement("return headers").build();
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

    private MethodSpec buildRefreshMethod(ClassName oauthTokenSupplierClassName, Optional<String> tokenPrefix) {
        // The generated OAuthTokenSupplier constructor takes an extra parameter for each non-literal
        // custom token-request property (scopes, custom body properties, headers), inserted between
        // clientSecret and authClient. This provider only has clientId/clientSecret, so it passes a
        // default for each extra property: Optional.empty() for optional properties, null otherwise.
        CodeBlock.Builder tokenSupplierArgs = CodeBlock.builder().add("clientId, clientSecret");
        for (OAuthTokenSupplierGenerator.OAuthTokenSupplierProperty property :
                OAuthTokenSupplierGenerator.computeCustomProperties(clientGeneratorContext, clientCredentials)) {
            if (property.isHardcoded()) {
                continue;
            }
            tokenSupplierArgs.add(", ");
            if (isOptionalType(property.getType())) {
                tokenSupplierArgs.add("$T.empty()", Optional.class);
            } else {
                tokenSupplierArgs.add("null");
            }
        }
        tokenSupplierArgs.add(", this.authClient");

        // Get the token response type - we'll use the OAuthTokenSupplier pattern
        // The refresh method calls the token endpoint and updates cached values
        MethodSpec.Builder method = MethodSpec.methodBuilder("refresh")
                .addModifiers(Modifier.PRIVATE)
                .returns(String.class)
                .addStatement("String clientId = this.clientIdSupplier.get()")
                .addStatement("String clientSecret = this.clientSecretSupplier.get()")
                .beginControlFlow("if (clientId == null || clientSecret == null)")
                .addStatement("throw new $T(AUTH_CONFIG_ERROR_MESSAGE)", RuntimeException.class)
                .endControlFlow()
                .addComment("Create a temporary token supplier to fetch the token")
                .addStatement(
                        "$T tokenSupplier = new $T($L)",
                        oauthTokenSupplierClassName,
                        oauthTokenSupplierClassName,
                        tokenSupplierArgs.build())
                .addStatement("String authHeader = tokenSupplier.get()");
        if (tokenPrefix.isEmpty()) {
            method.addStatement("this.accessToken = authHeader");
        } else {
            method.beginControlFlow("if (authHeader.startsWith($S))", tokenPrefix.get())
                    .addStatement(
                            "this.accessToken = authHeader.substring($L)",
                            tokenPrefix.get().length())
                    .nextControlFlow("else")
                    .addStatement("this.accessToken = authHeader")
                    .endControlFlow();
        }
        return method.addComment(
                        "Set expiration with buffer (we don't have access to expires_in here, so use 1 hour default)")
                .addStatement("this.expiresAt = getExpiresAt(3600)")
                .addStatement("return this.accessToken")
                .build();
    }

    private static boolean isOptionalType(TypeName type) {
        return type instanceof ParameterizedTypeName
                && ((ParameterizedTypeName) type).rawType.equals(ClassName.get("java.util", "Optional"));
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
        ParameterizedTypeName stringSupplierType =
                ParameterizedTypeName.get(ClassName.get(Supplier.class), ClassName.get(String.class));

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
            clientSecretCheck
                    .append(" || System.getenv(\"")
                    .append(clientSecretEnvVar)
                    .append("\") != null");
        }

        builder.addStatement("return (" + clientIdCheck + ") && (" + clientSecretCheck + ")");

        return builder.build();
    }
}
