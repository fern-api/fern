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

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.Map;
import java.util.function.Supplier;
import javax.lang.model.element.Modifier;

/**
 * Generates an InferredAuthProvider class that implements AuthProvider for inferred auth. This provider uses the
 * InferredAuthTokenSupplier to get auth headers from a token endpoint.
 */
public final class InferredAuthProviderGenerator extends AbstractFileGenerator {

    private final String schemeName;
    private final ClassName inferredAuthTokenSupplierClassName;

    public InferredAuthProviderGenerator(
            AbstractGeneratorContext<?, ?> generatorContext,
            String schemeName,
            ClassName inferredAuthTokenSupplierClassName) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName("InferredAuthProvider"), generatorContext);
        this.schemeName = schemeName;
        this.inferredAuthTokenSupplierClassName = inferredAuthTokenSupplierClassName;
    }

    public String getSchemeName() {
        return schemeName;
    }

    @Override
    public GeneratedJavaFile generateFile() {
        ClassName authProviderClassName =
                generatorContext.getPoetClassNameFactory().getCoreClassName("AuthProvider");
        ClassName endpointMetadataClassName =
                generatorContext.getPoetClassNameFactory().getCoreClassName("EndpointMetadata");

        // The InferredAuthTokenSupplier implements Supplier<Map<String, String>>
        ParameterizedTypeName mapStringStringType = ParameterizedTypeName.get(
                ClassName.get(Map.class), ClassName.get(String.class), ClassName.get(String.class));
        ParameterizedTypeName supplierType =
                ParameterizedTypeName.get(ClassName.get(Supplier.class), mapStringStringType);

        FieldSpec tokenSupplierField = FieldSpec.builder(
                        inferredAuthTokenSupplierClassName, "tokenSupplier", Modifier.PRIVATE, Modifier.FINAL)
                .build();

        String errorMessage =
                "Please provide the required credentials for " + schemeName + " when initializing the client";

        TypeSpec.Builder classBuilder = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addSuperinterface(authProviderClassName)
                .addJavadoc("Auth provider for inferred authentication ($L).\n", schemeName)
                .addJavadoc("Uses a token supplier to fetch and cache auth headers from the token endpoint.\n")
                .addField(
                        FieldSpec.builder(String.class, "AUTH_SCHEME", Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                                .initializer("$S", schemeName)
                                .build())
                .addField(FieldSpec.builder(
                                String.class,
                                "AUTH_CONFIG_ERROR_MESSAGE",
                                Modifier.PUBLIC,
                                Modifier.STATIC,
                                Modifier.FINAL)
                        .initializer("$S", errorMessage)
                        .build())
                .addField(tokenSupplierField)
                .addMethod(buildConstructor(tokenSupplierField))
                .addMethod(buildGetAuthHeaders(endpointMetadataClassName, tokenSupplierField));

        JavaFile javaFile =
                JavaFile.builder(className.packageName(), classBuilder.build()).build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }

    private MethodSpec buildConstructor(FieldSpec tokenSupplierField) {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(inferredAuthTokenSupplierClassName, "tokenSupplier")
                .addStatement("this.$N = tokenSupplier", tokenSupplierField)
                .build();
    }

    private MethodSpec buildGetAuthHeaders(ClassName endpointMetadataClassName, FieldSpec tokenSupplierField) {
        return MethodSpec.methodBuilder("getAuthHeaders")
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Override.class)
                .addParameter(endpointMetadataClassName, "endpointMetadata")
                .returns(ParameterizedTypeName.get(Map.class, String.class, String.class))
                .addComment("The token supplier returns a map of headers from the token endpoint")
                .addStatement("return $N.get()", tokenSupplierField)
                .build();
    }
}
