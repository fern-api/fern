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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

/**
 * Generates the RoutingAuthProvider class that routes to the appropriate auth provider
 * based on endpoint security requirements.
 */
public final class RoutingAuthProviderGenerator extends AbstractFileGenerator {

    public RoutingAuthProviderGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName("RoutingAuthProvider"), generatorContext);
    }

    @Override
    public GeneratedJavaFile generateFile() {
        ClassName authProviderClassName =
                generatorContext.getPoetClassNameFactory().getCoreClassName("AuthProvider");
        ClassName endpointMetadataClassName =
                generatorContext.getPoetClassNameFactory().getCoreClassName("EndpointMetadata");

        // Map<String, AuthProvider> authProviders
        ParameterizedTypeName providersMapType = ParameterizedTypeName.get(
                ClassName.get(Map.class), ClassName.get(String.class), authProviderClassName);

        // Map<String, String> authConfigErrorMessages
        ParameterizedTypeName errorMessagesMapType = ParameterizedTypeName.get(
                ClassName.get(Map.class), ClassName.get(String.class), ClassName.get(String.class));

        FieldSpec providersField = FieldSpec.builder(providersMapType, "authProviders", Modifier.PRIVATE, Modifier.FINAL)
                .build();

        FieldSpec errorMessagesField = FieldSpec.builder(errorMessagesMapType, "authConfigErrorMessages", Modifier.PRIVATE, Modifier.FINAL)
                .build();

        // List<Map<String, List<String>>> (security requirements type)
        ParameterizedTypeName scopesType = ParameterizedTypeName.get(
                ClassName.get(List.class), ClassName.get(String.class));
        ParameterizedTypeName schemeMapType = ParameterizedTypeName.get(
                ClassName.get(Map.class), ClassName.get(String.class), scopesType);
        ParameterizedTypeName securityType = ParameterizedTypeName.get(
                ClassName.get(List.class), schemeMapType);

        TypeSpec routingAuthProviderClass = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addSuperinterface(authProviderClassName)
                .addJavadoc("Auth provider that routes to the appropriate provider based on endpoint security requirements.\n")
                .addJavadoc("This implements the ENDPOINT_SECURITY auth mode where each endpoint can have different auth.\n")
                .addField(providersField)
                .addField(errorMessagesField)
                .addMethod(buildConstructor(providersField, errorMessagesField, providersMapType, errorMessagesMapType))
                .addMethod(buildGetAuthConfigErrorMessage())
                .addMethod(buildGetAuthHeaders(authProviderClassName, endpointMetadataClassName, providersField, securityType, schemeMapType))
                .addMethod(buildBuilderMethod())
                .addType(buildBuilderClass(authProviderClassName, providersMapType, errorMessagesMapType))
                .build();

        JavaFile javaFile = JavaFile.builder(className.packageName(), routingAuthProviderClass)
                .build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }

    private MethodSpec buildConstructor(
            FieldSpec providersField,
            FieldSpec errorMessagesField,
            ParameterizedTypeName providersMapType,
            ParameterizedTypeName errorMessagesMapType) {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PRIVATE)
                .addParameter(providersMapType, "authProviders")
                .addParameter(errorMessagesMapType, "authConfigErrorMessages")
                .addStatement("this.$N = authProviders", providersField)
                .addStatement("this.$N = authConfigErrorMessages", errorMessagesField)
                .build();
    }

    private MethodSpec buildGetAuthConfigErrorMessage() {
        return MethodSpec.methodBuilder("getAuthConfigErrorMessage")
                .addModifiers(Modifier.PRIVATE)
                .addParameter(String.class, "schemeKey")
                .returns(String.class)
                .addStatement("String message = this.authConfigErrorMessages.get(schemeKey)")
                .beginControlFlow("if (message != null)")
                .addStatement("return message")
                .endControlFlow()
                .addStatement("return \"Please provide the required authentication credentials for \" + schemeKey + \" when initializing the client\"")
                .build();
    }

    private MethodSpec buildGetAuthHeaders(
            ClassName authProviderClassName,
            ClassName endpointMetadataClassName,
            FieldSpec providersField,
            ParameterizedTypeName securityType,
            ParameterizedTypeName schemeMapType) {
        return MethodSpec.methodBuilder("getAuthHeaders")
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Override.class)
                .addParameter(endpointMetadataClassName, "endpointMetadata")
                .returns(ParameterizedTypeName.get(Map.class, String.class, String.class))
                .addStatement("$T security = endpointMetadata.getSecurity()", securityType)
                .addCode("\n")
                .addComment("If no security requirements, return empty headers")
                .beginControlFlow("if (security == null || security.isEmpty())")
                .addStatement("return new $T<>()", HashMap.class)
                .endControlFlow()
                .addCode("\n")
                .addComment("Check if any security requirement can be satisfied by available providers")
                .addStatement("boolean canSatisfyAnyRequirement = security.stream().anyMatch(securityRequirement -> \n" +
                        "    securityRequirement.keySet().stream().allMatch(schemeKey -> $N.containsKey(schemeKey)))", providersField)
                .addCode("\n")
                .beginControlFlow("if (!canSatisfyAnyRequirement)")
                .addComment("Build user-friendly error message showing which auth options are missing")
                .addStatement("String missingAuthHints = security.stream()\n" +
                        "    .map(req -> req.keySet().stream()\n" +
                        "        .filter(key -> !$N.containsKey(key))\n" +
                        "        .map(this::getAuthConfigErrorMessage)\n" +
                        "        .collect($T.joining(\" AND \")))\n" +
                        "    .collect($T.joining(\" OR \"))", providersField, Collectors.class, Collectors.class)
                .addStatement("throw new $T(\"No authentication credentials provided that satisfy the endpoint's security requirements. \" + missingAuthHints)",
                        RuntimeException.class)
                .endControlFlow()
                .addCode("\n")
                .addComment("Get the first security requirement that can be satisfied (OR relationship)")
                .addStatement("$T satisfiableRequirement = security.stream()\n" +
                        "    .filter(securityRequirement -> securityRequirement.keySet().stream()\n" +
                        "        .allMatch(schemeKey -> $N.containsKey(schemeKey)))\n" +
                        "    .findFirst()\n" +
                        "    .orElseThrow(() -> new $T(\"Internal error: no satisfiable requirement found\"))",
                        schemeMapType, providersField, RuntimeException.class)
                .addCode("\n")
                .addComment("Get auth for all schemes in the satisfiable requirement (AND relationship)")
                .addStatement("$T<String, String> combinedHeaders = new $T<>()", Map.class, HashMap.class)
                .beginControlFlow("for (String schemeKey : satisfiableRequirement.keySet())")
                .addStatement("$T provider = $N.get(schemeKey)", authProviderClassName, providersField)
                .beginControlFlow("if (provider == null)")
                .addStatement("throw new $T(\"Internal error: auth provider not found for scheme: \" + schemeKey)", RuntimeException.class)
                .endControlFlow()
                .addStatement("$T<String, String> headers = provider.getAuthHeaders(endpointMetadata)", Map.class)
                .addStatement("combinedHeaders.putAll(headers)")
                .endControlFlow()
                .addCode("\n")
                .addStatement("return combinedHeaders")
                .build();
    }

    private MethodSpec buildBuilderMethod() {
        ClassName builderClassName = className.nestedClass("Builder");
        return MethodSpec.methodBuilder("builder")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(builderClassName)
                .addStatement("return new $T()", builderClassName)
                .build();
    }

    private TypeSpec buildBuilderClass(
            ClassName authProviderClassName,
            ParameterizedTypeName providersMapType,
            ParameterizedTypeName errorMessagesMapType) {
        ClassName builderClassName = className.nestedClass("Builder");

        return TypeSpec.classBuilder("Builder")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                .addField(FieldSpec.builder(providersMapType, "authProviders", Modifier.PRIVATE, Modifier.FINAL)
                        .initializer("new $T<>()", HashMap.class)
                        .build())
                .addField(FieldSpec.builder(errorMessagesMapType, "authConfigErrorMessages", Modifier.PRIVATE, Modifier.FINAL)
                        .initializer("new $T<>()", HashMap.class)
                        .build())
                .addMethod(MethodSpec.methodBuilder("addAuthProvider")
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(String.class, "schemeName")
                        .addParameter(authProviderClassName, "provider")
                        .returns(builderClassName)
                        .addStatement("this.authProviders.put(schemeName, provider)")
                        .addStatement("return this")
                        .build())
                .addMethod(MethodSpec.methodBuilder("addAuthProvider")
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(String.class, "schemeName")
                        .addParameter(authProviderClassName, "provider")
                        .addParameter(String.class, "errorMessage")
                        .returns(builderClassName)
                        .addStatement("this.authProviders.put(schemeName, provider)")
                        .addStatement("this.authConfigErrorMessages.put(schemeName, errorMessage)")
                        .addStatement("return this")
                        .build())
                .addMethod(MethodSpec.methodBuilder("build")
                        .addModifiers(Modifier.PUBLIC)
                        .returns(className)
                        .addStatement("return new $T(this.authProviders, this.authConfigErrorMessages)", className)
                        .build())
                .build();
    }
}
