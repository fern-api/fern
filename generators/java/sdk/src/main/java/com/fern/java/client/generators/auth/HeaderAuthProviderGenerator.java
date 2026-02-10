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

import com.fern.ir.model.auth.HeaderAuthScheme;
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
import java.util.function.Supplier;
import javax.lang.model.element.Modifier;

/** Generates a HeaderAuthProvider class that implements AuthProvider for custom header auth (API keys). */
public final class HeaderAuthProviderGenerator extends AbstractFileGenerator {

    private final HeaderAuthScheme headerAuthScheme;
    private final String schemeName;

    public HeaderAuthProviderGenerator(
            AbstractGeneratorContext<?, ?> generatorContext, HeaderAuthScheme headerAuthScheme, String schemeName) {
        super(
                generatorContext.getPoetClassNameFactory().getCoreClassName(schemeName + "AuthProvider"),
                generatorContext);
        this.headerAuthScheme = headerAuthScheme;
        this.schemeName = schemeName;
    }

    public String getSchemeName() {
        return schemeName;
    }

    public String getHeaderName() {
        return headerAuthScheme.getName().getWireValue();
    }

    @Override
    public GeneratedJavaFile generateFile() {
        ClassName authProviderClassName =
                generatorContext.getPoetClassNameFactory().getCoreClassName("AuthProvider");
        ClassName endpointMetadataClassName =
                generatorContext.getPoetClassNameFactory().getCoreClassName("EndpointMetadata");

        ParameterizedTypeName stringSupplierType =
                ParameterizedTypeName.get(ClassName.get(Supplier.class), ClassName.get(String.class));

        FieldSpec valueSupplierField = FieldSpec.builder(
                        stringSupplierType, "valueSupplier", Modifier.PRIVATE, Modifier.FINAL)
                .build();

        String headerName = headerAuthScheme.getName().getWireValue();
        String envVar = headerAuthScheme.getHeaderEnvVar().map(ev -> ev.get()).orElse(null);
        String prefix = headerAuthScheme.getPrefix().orElse(null);

        String errorMessage = envVar != null
                ? "Please provide '"
                        + headerAuthScheme.getName().getName().getCamelCase().getSafeName()
                        + "' when initializing the client, or set the '" + envVar + "' environment variable"
                : "Please provide '"
                        + headerAuthScheme.getName().getName().getCamelCase().getSafeName()
                        + "' when initializing the client";

        TypeSpec.Builder classBuilder = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addSuperinterface(authProviderClassName)
                .addJavadoc("Auth provider for $L header authentication.\n", headerName)
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
                .addField(FieldSpec.builder(
                                String.class, "HEADER_NAME", Modifier.PRIVATE, Modifier.STATIC, Modifier.FINAL)
                        .initializer("$S", headerName)
                        .build());

        if (prefix != null) {
            classBuilder.addField(
                    FieldSpec.builder(String.class, "PREFIX", Modifier.PRIVATE, Modifier.STATIC, Modifier.FINAL)
                            .initializer("$S", prefix + " ")
                            .build());
        }

        classBuilder
                .addField(valueSupplierField)
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(stringSupplierType, "valueSupplier")
                        .addStatement("this.$N = valueSupplier", valueSupplierField)
                        .build())
                .addMethod(buildGetAuthHeaders(endpointMetadataClassName, valueSupplierField, prefix != null))
                .addMethod(buildCanCreateMethod(envVar));

        JavaFile javaFile =
                JavaFile.builder(className.packageName(), classBuilder.build()).build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }

    private MethodSpec buildGetAuthHeaders(
            ClassName endpointMetadataClassName, FieldSpec valueSupplierField, boolean hasPrefix) {
        MethodSpec.Builder builder = MethodSpec.methodBuilder("getAuthHeaders")
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Override.class)
                .addParameter(endpointMetadataClassName, "endpointMetadata")
                .returns(ParameterizedTypeName.get(Map.class, String.class, String.class))
                .addStatement("String value = $N.get()", valueSupplierField)
                .beginControlFlow("if (value == null)")
                .addStatement("throw new $T(AUTH_CONFIG_ERROR_MESSAGE)", RuntimeException.class)
                .endControlFlow()
                .addStatement("$T<String, String> headers = new $T<>()", Map.class, HashMap.class);

        if (hasPrefix) {
            builder.addStatement("headers.put(HEADER_NAME, PREFIX + value)");
        } else {
            builder.addStatement("headers.put(HEADER_NAME, value)");
        }

        return builder.addStatement("return headers").build();
    }

    private MethodSpec buildCanCreateMethod(String envVar) {
        ParameterizedTypeName stringSupplierType =
                ParameterizedTypeName.get(ClassName.get(Supplier.class), ClassName.get(String.class));

        MethodSpec.Builder builder = MethodSpec.methodBuilder("canCreate")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addJavadoc("Checks if this provider can be created with the given value supplier.\n")
                .addParameter(stringSupplierType, "valueSupplier")
                .returns(boolean.class);

        if (envVar != null) {
            builder.addStatement("return valueSupplier != null || System.getenv($S) != null", envVar);
        } else {
            builder.addStatement("return valueSupplier != null");
        }

        return builder.build();
    }
}
