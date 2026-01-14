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

import com.fern.ir.model.auth.BearerAuthScheme;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;
import javax.lang.model.element.Modifier;

/**
 * Generates a BearerAuthProvider class that implements AuthProvider for bearer token auth.
 */
public final class BearerAuthProviderGenerator extends AbstractFileGenerator {

    public static final String AUTH_SCHEME_NAME = "Bearer";

    private final BearerAuthScheme bearerAuthScheme;

    public BearerAuthProviderGenerator(AbstractGeneratorContext<?, ?> generatorContext, BearerAuthScheme bearerAuthScheme) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName("BearerAuthProvider"), generatorContext);
        this.bearerAuthScheme = bearerAuthScheme;
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

        // Supplier<String> for token
        ParameterizedTypeName tokenSupplierType = ParameterizedTypeName.get(
                ClassName.get(Supplier.class), ClassName.get(String.class));

        FieldSpec tokenSupplierField = FieldSpec.builder(tokenSupplierType, "tokenSupplier", Modifier.PRIVATE, Modifier.FINAL)
                .build();

        String envVar = bearerAuthScheme.getTokenEnvVar().map(ev -> ev.get()).orElse(null);
        String errorMessage = envVar != null
                ? "Please provide 'token' when initializing the client, or set the '" + envVar + "' environment variable"
                : "Please provide 'token' when initializing the client";

        TypeSpec bearerAuthProviderClass = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addSuperinterface(authProviderClassName)
                .addJavadoc("Auth provider for Bearer token authentication.\n")
                .addField(FieldSpec.builder(String.class, "AUTH_SCHEME", Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                        .initializer("$S", AUTH_SCHEME_NAME)
                        .build())
                .addField(FieldSpec.builder(String.class, "AUTH_CONFIG_ERROR_MESSAGE", Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                        .initializer("$S", errorMessage)
                        .build())
                .addField(tokenSupplierField)
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(tokenSupplierType, "tokenSupplier")
                        .addStatement("this.$N = tokenSupplier", tokenSupplierField)
                        .build())
                .addMethod(buildGetAuthHeaders(endpointMetadataClassName, tokenSupplierField))
                .addMethod(buildCanCreateMethod(envVar))
                .build();

        JavaFile javaFile = JavaFile.builder(className.packageName(), bearerAuthProviderClass)
                .build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }

    private MethodSpec buildGetAuthHeaders(ClassName endpointMetadataClassName, FieldSpec tokenSupplierField) {
        return MethodSpec.methodBuilder("getAuthHeaders")
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Override.class)
                .addParameter(endpointMetadataClassName, "endpointMetadata")
                .returns(ParameterizedTypeName.get(Map.class, String.class, String.class))
                .addStatement("String token = $N.get()", tokenSupplierField)
                .beginControlFlow("if (token == null)")
                .addStatement("throw new $T(AUTH_CONFIG_ERROR_MESSAGE)", RuntimeException.class)
                .endControlFlow()
                .addStatement("$T<String, String> headers = new $T<>()", Map.class, HashMap.class)
                .addStatement("headers.put($S, $S + token)", "Authorization", "Bearer ")
                .addStatement("return headers")
                .build();
    }

    private MethodSpec buildCanCreateMethod(String envVar) {
        MethodSpec.Builder builder = MethodSpec.methodBuilder("canCreate")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addJavadoc("Checks if this provider can be created with the given token supplier.\n")
                .addParameter(ParameterizedTypeName.get(
                        ClassName.get(Supplier.class), ClassName.get(String.class)), "tokenSupplier")
                .returns(boolean.class);

        if (envVar != null) {
            builder.addStatement("return tokenSupplier != null || System.getenv($S) != null", envVar);
        } else {
            builder.addStatement("return tokenSupplier != null");
        }

        return builder.build();
    }
}
