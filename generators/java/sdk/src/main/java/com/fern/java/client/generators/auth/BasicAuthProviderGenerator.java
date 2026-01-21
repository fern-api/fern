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

import com.fern.ir.model.auth.BasicAuthScheme;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;
import javax.lang.model.element.Modifier;

/** Generates a BasicAuthProvider class that implements AuthProvider for basic auth. */
public final class BasicAuthProviderGenerator extends AbstractFileGenerator {

    public static final String AUTH_SCHEME_NAME = "Basic";

    private final BasicAuthScheme basicAuthScheme;

    public BasicAuthProviderGenerator(
            AbstractGeneratorContext<?, ?> generatorContext, BasicAuthScheme basicAuthScheme) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName("BasicAuthProvider"), generatorContext);
        this.basicAuthScheme = basicAuthScheme;
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

        ParameterizedTypeName stringSupplierType =
                ParameterizedTypeName.get(ClassName.get(Supplier.class), ClassName.get(String.class));

        FieldSpec usernameSupplierField = FieldSpec.builder(
                        stringSupplierType, "usernameSupplier", Modifier.PRIVATE, Modifier.FINAL)
                .build();
        FieldSpec passwordSupplierField = FieldSpec.builder(
                        stringSupplierType, "passwordSupplier", Modifier.PRIVATE, Modifier.FINAL)
                .build();

        String usernameEnvVar =
                basicAuthScheme.getUsernameEnvVar().map(ev -> ev.get()).orElse(null);
        String passwordEnvVar =
                basicAuthScheme.getPasswordEnvVar().map(ev -> ev.get()).orElse(null);

        String errorMessage = "Please provide username and password when initializing the client";

        TypeSpec basicAuthProviderClass = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addSuperinterface(authProviderClassName)
                .addJavadoc("Auth provider for Basic authentication.\n")
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
                .addField(usernameSupplierField)
                .addField(passwordSupplierField)
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(stringSupplierType, "usernameSupplier")
                        .addParameter(stringSupplierType, "passwordSupplier")
                        .addStatement("this.$N = usernameSupplier", usernameSupplierField)
                        .addStatement("this.$N = passwordSupplier", passwordSupplierField)
                        .build())
                .addMethod(buildGetAuthHeaders(endpointMetadataClassName, usernameSupplierField, passwordSupplierField))
                .addMethod(buildCanCreateMethod(usernameEnvVar, passwordEnvVar))
                .build();

        JavaFile javaFile = JavaFile.builder(className.packageName(), basicAuthProviderClass)
                .build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }

    private MethodSpec buildGetAuthHeaders(
            ClassName endpointMetadataClassName, FieldSpec usernameSupplierField, FieldSpec passwordSupplierField) {
        return MethodSpec.methodBuilder("getAuthHeaders")
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Override.class)
                .addParameter(endpointMetadataClassName, "endpointMetadata")
                .returns(ParameterizedTypeName.get(Map.class, String.class, String.class))
                .addStatement("String username = $N.get()", usernameSupplierField)
                .addStatement("String password = $N.get()", passwordSupplierField)
                .beginControlFlow("if (username == null || password == null)")
                .addStatement("throw new $T(AUTH_CONFIG_ERROR_MESSAGE)", RuntimeException.class)
                .endControlFlow()
                .addStatement("String credentials = username + \":\" + password")
                .addStatement(
                        "String encoded = $T.getEncoder().encodeToString(credentials.getBytes($T.UTF_8))",
                        Base64.class,
                        StandardCharsets.class)
                .addStatement("$T<String, String> headers = new $T<>()", Map.class, HashMap.class)
                .addStatement("headers.put($S, $S + encoded)", "Authorization", "Basic ")
                .addStatement("return headers")
                .build();
    }

    private MethodSpec buildCanCreateMethod(String usernameEnvVar, String passwordEnvVar) {
        ParameterizedTypeName stringSupplierType =
                ParameterizedTypeName.get(ClassName.get(Supplier.class), ClassName.get(String.class));

        MethodSpec.Builder builder = MethodSpec.methodBuilder("canCreate")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addJavadoc("Checks if this provider can be created with the given suppliers.\n")
                .addParameter(stringSupplierType, "usernameSupplier")
                .addParameter(stringSupplierType, "passwordSupplier")
                .returns(boolean.class);

        StringBuilder condition = new StringBuilder();
        condition.append("(usernameSupplier != null");
        if (usernameEnvVar != null) {
            condition.append(" || System.getenv(\"").append(usernameEnvVar).append("\") != null");
        }
        condition.append(") && (passwordSupplier != null");
        if (passwordEnvVar != null) {
            condition.append(" || System.getenv(\"").append(passwordEnvVar).append("\") != null");
        }
        condition.append(")");

        builder.addStatement("return " + condition);

        return builder.build();
    }
}
