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
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratedHttpServiceClient;
import com.fern.codegen.GeneratedHttpServiceInterface;
import com.fern.codegen.Generator;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.generator.AnyAuthGenerator;
import com.fern.codegen.utils.AuthSchemeUtils;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.types.AuthSchemesRequirement;
import com.fern.types.DeclaredErrorName;
import com.fern.types.services.HttpEndpoint;
import com.fern.types.services.HttpEndpointId;
import com.fern.types.services.HttpService;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.immutables.value.Value;

public final class HttpServiceClientGenerator extends Generator {

    private static final String STATIC_BUILDER_METHOD_NAME = "builder";
    private static final String SERVICE_FIELD_NAME = "service";
    private static final String AUTH_FIELD_NAME = "auth";
    private static final String CLIENT_SUFFIX = "Client";
    private static final String REQUEST_CLASS_NAME = "Request";
    private static final String REQUEST_PARAMETER_NAME = "request";
    private static final String AUTH_REQUEST_PARAMETER = "authOverride";

    private final HttpService httpService;
    private final ClassName generatedServiceClientClassName;
    private final Map<HttpEndpointId, GeneratedEndpointModel> generatedEndpointModels;
    private final Map<DeclaredErrorName, GeneratedError> generatedErrors;
    private final Optional<GeneratedAuthSchemes> maybeGeneratedAuthSchemes;

    public HttpServiceClientGenerator(
            GeneratorContext generatorContext,
            HttpService httpService,
            Map<HttpEndpointId, GeneratedEndpointModel> generatedEndpointModels,
            Map<DeclaredErrorName, GeneratedError> generatedErrors,
            Optional<GeneratedAuthSchemes> maybeGeneratedAuthSchemes) {
        super(generatorContext);
        this.httpService = httpService;
        this.generatedEndpointModels = generatedEndpointModels;
        this.generatedServiceClientClassName = generatorContext
                .getClassNameUtils()
                .getClassNameFromServiceName(httpService.name(), CLIENT_SUFFIX, PackageType.CLIENT);
        this.generatedErrors = generatedErrors;
        this.maybeGeneratedAuthSchemes = maybeGeneratedAuthSchemes;
    }

    @Override
    public GeneratedHttpServiceClient generate() {
        HttpServiceInterfaceGenerator httpServiceInterfaceGenerator = new HttpServiceInterfaceGenerator(
                generatorContext,
                generatedEndpointModels,
                generatedErrors,
                maybeGeneratedAuthSchemes
                        .map(GeneratedAuthSchemes::generatedAuthSchemes)
                        .orElseGet(Collections::emptyMap),
                httpService);
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

        List<GeneratedEndpointClient> endpointFiles = new ArrayList<>();
        for (HttpEndpoint httpEndpoint : httpService.endpoints()) {
            MethodSpec interfaceMethod =
                    generatedHttpServiceInterface.endpointMethods().get(httpEndpoint.id());
            MethodSpec.Builder endpointMethodBuilder =
                    MethodSpec.methodBuilder(httpEndpoint.id().value()).addModifiers(Modifier.PUBLIC);

            if (interfaceMethod.parameters.size() <= 1) {
                generateCallWithNoWrappedRequest(httpEndpoint, interfaceMethod, endpointMethodBuilder);
            } else {
                GeneratedEndpointClient generatedEndpointFile =
                        generateCallWithWrappedRequest(httpEndpoint, interfaceMethod, endpointMethodBuilder);
                endpointFiles.add(generatedEndpointFile);
            }

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
                .addAllEndpointFiles(endpointFiles)
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

    private void generateCallWithNoWrappedRequest(
            HttpEndpoint httpEndpoint, MethodSpec interfaceMethod, MethodSpec.Builder endpointMethodBuilder) {
        List<ParameterSpec> parameters = new ArrayList<>();
        List<String> args = new ArrayList<>();
        if (httpEndpoint.auth() && maybeGeneratedAuthSchemes.isPresent()) {
            parameters.add(ParameterSpec.builder(
                            ParameterizedTypeName.get(
                                    ClassName.get(Optional.class),
                                    maybeGeneratedAuthSchemes.get().className()),
                            AUTH_REQUEST_PARAMETER)
                    .build());
            endpointMethodBuilder.addStatement(
                    "$T authValue = $L.orElse(this.$L.orElseThrow(() -> new $T($S)))",
                    maybeGeneratedAuthSchemes.get().className(),
                    AUTH_REQUEST_PARAMETER,
                    AUTH_FIELD_NAME,
                    RuntimeException.class,
                    "Auth is required for " + httpEndpoint.id().value());
            args.add("authValue");
        } else {
            interfaceMethod.parameters.forEach(interfaceParameter -> {
                parameters.add(ParameterSpec.builder(interfaceParameter.type, interfaceParameter.name)
                        .build());
                args.add(interfaceParameter.name);
            });
        }
        endpointMethodBuilder.addParameters(parameters);
        String joinedParameters = String.join(", ", args);
        String codeBlockFormat = "this.$L.$L(" + joinedParameters + ")";
        if (interfaceMethod.returnType.equals(TypeName.VOID)) {
            endpointMethodBuilder.addStatement(codeBlockFormat, SERVICE_FIELD_NAME, interfaceMethod.name);
        } else {
            endpointMethodBuilder.addStatement("return " + codeBlockFormat, SERVICE_FIELD_NAME, interfaceMethod.name);
        }
    }

    private GeneratedEndpointClient generateCallWithWrappedRequest(
            HttpEndpoint httpEndpoint, MethodSpec interfaceMethod, MethodSpec.Builder endpointMethodBuilder) {
        GeneratedEndpointClient generatedEndpointFile = generateEndpointFile(httpEndpoint);
        endpointMethodBuilder.addParameter(ParameterSpec.builder(
                        generatedEndpointFile.generatedRequestInfo().requestClassName(), REQUEST_PARAMETER_NAME)
                .build());
        String args;
        if (maybeGeneratedAuthSchemes.isPresent()) {
            GeneratedAuthSchemes generatedAuthSchemes = maybeGeneratedAuthSchemes.get();
            endpointMethodBuilder.addStatement(
                    "$T authValue = $L.$L().orElse(this.$L.orElseThrow(() -> new $T($S)))",
                    maybeGeneratedAuthSchemes.get().className(),
                    REQUEST_PARAMETER_NAME,
                    generatedEndpointFile
                            .generatedRequestInfo()
                            .authMethodSpec()
                            .get()
                            .name,
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
                    i
                            < generatedEndpointFile
                                    .generatedRequestInfo()
                                    .propertyMethodSpecs()
                                    .size();
                    ++i) {
                MethodSpec propertyMethodSpec = generatedEndpointFile
                        .generatedRequestInfo()
                        .propertyMethodSpecs()
                        .get(i);
                argTokens.add(REQUEST_PARAMETER_NAME + "." + propertyMethodSpec.name + "()");
            }
            args = argTokens.stream().collect(Collectors.joining(", "));
        } else {
            args = generatedEndpointFile.generatedRequestInfo().propertyMethodSpecs().stream()
                    .map(requestMethodSpec -> REQUEST_PARAMETER_NAME + "." + requestMethodSpec.name + "()")
                    .collect(Collectors.joining(", "));
        }
        String codeBlockFormat = "this.$L.$L(" + args + ")";
        if (interfaceMethod.returnType.equals(TypeName.VOID)) {
            endpointMethodBuilder.addStatement(codeBlockFormat, SERVICE_FIELD_NAME, interfaceMethod.name);
        } else {
            endpointMethodBuilder.addStatement("return " + codeBlockFormat, SERVICE_FIELD_NAME, interfaceMethod.name);
        }
        return generatedEndpointFile;
    }

    private GeneratedEndpointClient generateEndpointFile(HttpEndpoint httpEndpoint) {
        ClassName endpointClassName = generatorContext
                .getClassNameUtils()
                .getClassNameFromEndpointId(httpService.name(), httpEndpoint.id(), PackageType.CLIENT);
        ClassName immutablesEndpointClassName =
                generatorContext.getImmutablesUtils().getImmutablesClassName(endpointClassName);
        TypeSpec.Builder endpointTypeSpecBuilder = TypeSpec.classBuilder(endpointClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addAnnotation(AnnotationSpec.builder(Value.Enclosing.class).build())
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .build());
        GeneratedRequestInfo generatedRequestInfo =
                generateRequestType(httpEndpoint, endpointClassName, immutablesEndpointClassName);
        endpointTypeSpecBuilder.addType(generatedRequestInfo.requestTypeSpec());
        TypeSpec endpointTypeSpec = endpointTypeSpecBuilder.build();
        JavaFile endpointJavaFile = JavaFile.builder(endpointClassName.packageName(), endpointTypeSpec)
                .build();
        return GeneratedEndpointClient.builder()
                .file(endpointJavaFile)
                .className(endpointClassName)
                .generatedRequestInfo(generatedRequestInfo)
                .build();
    }

    private GeneratedRequestInfo generateRequestType(
            HttpEndpoint httpEndpoint, ClassName endpointClassName, ClassName immutablesEndpointClassName) {
        ClassName requestClassName = generatorContext
                .getClassNameUtils()
                .getClassName(
                        REQUEST_CLASS_NAME,
                        Optional.empty(),
                        Optional.of(httpService.name().fernFilepath()),
                        PackageType.CLIENT);
        List<ParameterSpec> requestParameters = getRequestParameters(httpEndpoint);
        List<MethodSpec> parameterImmutablesMethods = requestParameters.stream()
                .map(endpointParameter -> MethodSpec.methodBuilder(endpointParameter.name)
                        .returns(endpointParameter.type)
                        .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                        .build())
                .collect(Collectors.toList());
        TypeSpec typeSpec = TypeSpec.interfaceBuilder(requestClassName)
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Value.Immutable.class)
                .addAnnotation(StagedBuilderImmutablesStyle.class)
                .addMethods(parameterImmutablesMethods)
                .addMethod(generateStaticBuilder(immutablesEndpointClassName))
                .build();

        Optional<MethodSpec> authMethodSpec = Optional.empty();
        if (httpEndpoint.auth() && maybeGeneratedAuthSchemes.isPresent()) {
            authMethodSpec = Optional.of(parameterImmutablesMethods.get(0));
        }
        return GeneratedRequestInfo.builder()
                .requestTypeSpec(typeSpec)
                .requestClassName(endpointClassName.nestedClass(REQUEST_CLASS_NAME))
                .authMethodSpec(authMethodSpec)
                .addAllPropertyMethodSpecs(parameterImmutablesMethods)
                .build();
    }

    private List<ParameterSpec> getRequestParameters(HttpEndpoint httpEndpoint) {
        List<ParameterSpec> requestParameters = new ArrayList<>();
        List<ParameterSpec> interfaceEndpointParameters = HttpEndpointArgumentUtils.getHttpEndpointArguments(
                httpService,
                httpEndpoint,
                generatorContext,
                generatedEndpointModels,
                maybeGeneratedAuthSchemes
                        .map(GeneratedAuthSchemes::generatedAuthSchemes)
                        .orElseGet(Collections::emptyMap));
        if (httpEndpoint.auth() && maybeGeneratedAuthSchemes.isPresent()) {
            GeneratedAuthSchemes generatedAuthSchemes = maybeGeneratedAuthSchemes.get();
            requestParameters.add(ParameterSpec.builder(
                            ParameterizedTypeName.get(ClassName.get(Optional.class), generatedAuthSchemes.className()),
                            AUTH_REQUEST_PARAMETER)
                    .build());
            for (int i = generatedAuthSchemes.generatedAuthSchemes().size();
                    i < interfaceEndpointParameters.size();
                    ++i) {
                requestParameters.add(interfaceEndpointParameters.get(i));
            }
        } else {
            requestParameters.addAll(interfaceEndpointParameters);
        }
        return requestParameters;
    }

    private MethodSpec generateStaticBuilder(ClassName immutablesEndpointClassName) {
        ClassName builderClassName =
                immutablesEndpointClassName.nestedClass(REQUEST_CLASS_NAME).nestedClass("Builder");
        return MethodSpec.methodBuilder(STATIC_BUILDER_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(builderClassName)
                .addCode("return $T.builder();", immutablesEndpointClassName.nestedClass(REQUEST_CLASS_NAME))
                .build();
    }
}
