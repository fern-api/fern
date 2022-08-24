/*
 * (c) Copyright 2022 Birch Solutions Inc. All rights reserved.
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

package com.fern.jersey.client;

import com.fern.codegen.GeneratedAuthSchemes;
import com.fern.codegen.GeneratedEndpointClient;
import com.fern.codegen.GeneratedEndpointClient.GeneratedRequestInfo;
import com.fern.codegen.GeneratedEndpointModel;
import com.fern.codegen.GeneratedHttpServiceClient;
import com.fern.codegen.GeneratedHttpServiceInterface;
import com.fern.codegen.Generator;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.IGeneratedFile;
import com.fern.codegen.generator.auth.AnyAuthGenerator;
import com.fern.codegen.utils.AuthSchemeUtils;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.types.AuthSchemesRequirement;
import com.fern.types.DeclaredErrorName;
import com.fern.types.services.HttpEndpoint;
import com.fern.types.services.HttpEndpointId;
import com.fern.types.services.HttpService;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class HttpServiceClientGenerator extends Generator {
    private static final String SERVICE_FIELD_NAME = "service";
    private static final String AUTH_FIELD_NAME = "auth";
    private static final String CLIENT_SUFFIX = "Client";
    private static final String REQUEST_PARAMETER_NAME = "request";

    private final HttpService httpService;
    private final ClassName generatedServiceClientClassName;
    private final Map<HttpEndpointId, GeneratedEndpointModel> generatedEndpointModels;
    private final Map<DeclaredErrorName, IGeneratedFile> generatedErrors;
    private final Optional<GeneratedAuthSchemes> maybeGeneratedAuthSchemes;
    private final ClientClassNameUtils clientClassNameUtils;

    public HttpServiceClientGenerator(
            GeneratorContext generatorContext,
            HttpService httpService,
            Map<HttpEndpointId, GeneratedEndpointModel> generatedEndpointModels,
            Map<DeclaredErrorName, IGeneratedFile> generatedErrors,
            Optional<GeneratedAuthSchemes> maybeGeneratedAuthSchemes) {
        super(generatorContext);
        this.httpService = httpService;
        this.generatedEndpointModels = generatedEndpointModels;
        this.generatedServiceClientClassName = generatorContext
                .getClassNameUtils()
                .getClassNameFromServiceName(httpService.name(), CLIENT_SUFFIX, PackageType.CLIENT);
        this.generatedErrors = generatedErrors;
        this.maybeGeneratedAuthSchemes = maybeGeneratedAuthSchemes;
        this.clientClassNameUtils =
                new ClientClassNameUtils(generatorContext.getIr(), generatorContext.getOrganization());
    }

    @Override
    public GeneratedHttpServiceClient generate() {
        HttpServiceInterfaceGenerator httpServiceInterfaceGenerator = new HttpServiceInterfaceGenerator(
                generatorContext, generatedEndpointModels, generatedErrors, maybeGeneratedAuthSchemes, httpService);
        GeneratedHttpServiceInterface generatedHttpServiceInterface = httpServiceInterfaceGenerator.generate();
        TypeSpec.Builder serviceClientBuilder = TypeSpec.classBuilder(generatedServiceClientClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(FieldSpec.builder(
                                generatedHttpServiceInterface.className(),
                                SERVICE_FIELD_NAME,
                                Modifier.PRIVATE,
                                Modifier.FINAL)
                        .build());
        maybeGeneratedAuthSchemes.ifPresent(generatedAuthSchemes -> serviceClientBuilder.addField(FieldSpec.builder(
                        ParameterizedTypeName.get(ClassName.get(Optional.class), generatedAuthSchemes.className()),
                        AUTH_FIELD_NAME,
                        Modifier.PRIVATE,
                        Modifier.FINAL)
                .build()));
        serviceClientBuilder.addMethod(getUrlConstructor(generatedHttpServiceInterface));
        maybeGeneratedAuthSchemes.ifPresent(generatedAuthSchemes -> serviceClientBuilder.addMethod(
                getUrlAuthConstructor(generatedHttpServiceInterface, generatedAuthSchemes)));

        for (HttpEndpoint httpEndpoint : httpService.endpoints()) {
            Optional<GeneratedEndpointClient> endpointFile =
                    generatedHttpServiceInterface.endpointFiles().get(httpEndpoint.id());
            MethodSpec interfaceMethod =
                    generatedHttpServiceInterface.endpointMethods().get(httpEndpoint.id());
            MethodSpec.Builder endpointMethodBuilder =
                    MethodSpec.methodBuilder(httpEndpoint.id().value()).addModifiers(Modifier.PUBLIC);

            generateCallWithWrappedRequest(
                    httpEndpoint,
                    interfaceMethod,
                    endpointFile.map(GeneratedEndpointClient::generatedNestedRequest),
                    endpointMethodBuilder);

            endpointMethodBuilder.addExceptions(interfaceMethod.exceptions);
            endpointMethodBuilder.returns(interfaceMethod.returnType);
            serviceClientBuilder.addMethod(endpointMethodBuilder.build());
        }

        TypeSpec serviceClientTypeSpec = serviceClientBuilder.build();
        JavaFile serviceClientJavaFile = JavaFile.builder(
                        generatedServiceClientClassName.packageName(), serviceClientTypeSpec)
                .build();
        return GeneratedHttpServiceClient.builder()
                .file(serviceClientJavaFile)
                .className(generatedServiceClientClassName)
                .serviceInterface(generatedHttpServiceInterface)
                .build();
    }

    private MethodSpec getUrlConstructor(GeneratedHttpServiceInterface generatedHttpServiceInterface) {
        MethodSpec.Builder constructorBuilder =
                MethodSpec.constructorBuilder().addModifiers(Modifier.PUBLIC).addParameter(String.class, "url");
        constructorBuilder.addStatement(
                "this.$L = $T.$L($L)",
                SERVICE_FIELD_NAME,
                generatedHttpServiceInterface.className(),
                HttpServiceInterfaceGenerator.GET_CLIENT_METHOD_NAME,
                "url");
        if (maybeGeneratedAuthSchemes.isPresent()) {
            constructorBuilder
                    .addStatement("this.$L = $T.empty()", AUTH_FIELD_NAME, Optional.class)
                    .build();
        }
        return constructorBuilder.build();
    }

    private MethodSpec getUrlAuthConstructor(
            GeneratedHttpServiceInterface generatedHttpServiceInterface, GeneratedAuthSchemes generatedAuthSchemes) {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(String.class, "url")
                .addParameter(generatedAuthSchemes.className(), AUTH_FIELD_NAME)
                .addStatement(
                        "this.$L = $T.$L($L)",
                        SERVICE_FIELD_NAME,
                        generatedHttpServiceInterface.className(),
                        HttpServiceInterfaceGenerator.GET_CLIENT_METHOD_NAME,
                        "url")
                .addStatement("this.$L = $T.of($L)", AUTH_FIELD_NAME, Optional.class, AUTH_FIELD_NAME)
                .build();
    }

    private void generateCallWithWrappedRequest(
            HttpEndpoint httpEndpoint,
            MethodSpec interfaceMethod,
            Optional<GeneratedRequestInfo> maybeGeneratedRequestInfo,
            MethodSpec.Builder endpointMethodBuilder) {
        if (maybeGeneratedRequestInfo.isEmpty()) {
            endpointMethodBuilder.addStatement("this.$L.$L()", SERVICE_FIELD_NAME, interfaceMethod.name);
            return;
        }
        GeneratedRequestInfo generatedRequestInfo = maybeGeneratedRequestInfo.get();
        endpointMethodBuilder.addParameter(
                ParameterSpec.builder(generatedRequestInfo.requestClassName(), REQUEST_PARAMETER_NAME)
                        .build());
        String args;
        if (httpEndpoint.auth() && maybeGeneratedAuthSchemes.isPresent()) {
            GeneratedAuthSchemes generatedAuthSchemes = maybeGeneratedAuthSchemes.get();
            endpointMethodBuilder.addStatement(
                    "$T authValue = $L.$L().orElse(this.$L.orElseThrow(() -> new $T($S)))",
                    maybeGeneratedAuthSchemes.get().className(),
                    REQUEST_PARAMETER_NAME,
                    generatedRequestInfo.authMethodSpec().get().name,
                    AUTH_FIELD_NAME,
                    RuntimeException.class,
                    "Auth is required for " + httpEndpoint.id().value());
            List<String> argTokens = new ArrayList<>();
            if (generatedAuthSchemes.generatedAuthSchemes().size() == 1) {
                argTokens.add("authValue");
            } else if (generatorContext.getApiAuth().requirement().equals(AuthSchemesRequirement.ALL)) {
                generatedAuthSchemes.generatedAuthSchemes().forEach(((authScheme, generatedFile) -> {
                    argTokens.add("authValue." + AuthSchemeUtils.getAuthSchemeCamelCaseName(authScheme) + "()");
                }));
            } else if (generatorContext.getApiAuth().requirement().equals(AuthSchemesRequirement.ANY)) {
                generatedAuthSchemes
                        .generatedAuthSchemes()
                        .forEach((authScheme, generatedFile) ->
                                argTokens.add("authValue." + AnyAuthGenerator.GET_AUTH_PREFIX
                                        + AuthSchemeUtils.getAuthSchemePascalCaseName(authScheme) + "()"));
            }
            for (int i = generatedAuthSchemes.generatedAuthSchemes().size();
                    i < generatedRequestInfo.enrichedObjectProperty().size();
                    ++i) {
                MethodSpec propertyMethodSpec =
                        generatedRequestInfo.enrichedObjectProperty().get(i).getterProperty();
                argTokens.add(REQUEST_PARAMETER_NAME + "." + propertyMethodSpec.name + "()");
            }
            args = argTokens.stream().collect(Collectors.joining(", "));
        } else {
            args = generatedRequestInfo.enrichedObjectProperty().stream()
                    .map(enrichedObjectProperty ->
                            REQUEST_PARAMETER_NAME + "." + enrichedObjectProperty.getterProperty().name + "()")
                    .collect(Collectors.joining(", "));
        }
        String codeBlockFormat = "this.$L.$L(" + args + ")";
        if (interfaceMethod.returnType.equals(TypeName.VOID)) {
            endpointMethodBuilder.addStatement(codeBlockFormat, SERVICE_FIELD_NAME, interfaceMethod.name);
        } else {
            endpointMethodBuilder.addStatement("return " + codeBlockFormat, SERVICE_FIELD_NAME, interfaceMethod.name);
        }
    }
}
