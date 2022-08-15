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

import com.fern.codegen.GeneratedEndpointClient;
import com.fern.codegen.GeneratedEndpointClient.GeneratedRequestInfo;
import com.fern.codegen.GeneratedEndpointModel;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratedHttpServiceClient;
import com.fern.codegen.GeneratedHttpServiceInterface;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.model.codegen.Generator;
import com.fern.types.ErrorName;
import com.fern.types.services.EndpointId;
import com.fern.types.services.HttpEndpoint;
import com.fern.types.services.HttpService;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.immutables.value.Value;

public final class HttpServiceClientGenerator extends Generator {
    private static final String STATIC_BUILDER_METHOD_NAME = "builder";
    private static final String SERVICE_FIELD_NAME = "service";
    private static final String CLIENT_SUFFIX = "Client";
    private static final String REQUEST_CLASS_NAME = "Request";

    private static final String REQUEST_PARAMETER_NAME = "request";

    private final HttpService httpService;

    private final ClassName generatedServiceClientClassName;

    private final Map<EndpointId, GeneratedEndpointModel> generatedEndpointModels;

    private final Map<ErrorName, GeneratedError> generatedErrors;

    public HttpServiceClientGenerator(
            GeneratorContext generatorContext,
            HttpService httpService,
            Map<EndpointId, GeneratedEndpointModel> generatedEndpointModels,
            Map<ErrorName, GeneratedError> generatedErrors) {
        super(generatorContext);
        this.httpService = httpService;
        this.generatedEndpointModels = generatedEndpointModels;
        this.generatedServiceClientClassName = generatorContext
                .getClassNameUtils()
                .getClassNameFromServiceName(httpService.name(), CLIENT_SUFFIX, PackageType.CLIENT);
        this.generatedErrors = generatedErrors;
    }

    @Override
    public GeneratedHttpServiceClient generate() {
        HttpServiceInterfaceGenerator httpServiceInterfaceGenerator = new HttpServiceInterfaceGenerator(
                generatorContext, generatedEndpointModels, generatedErrors, httpService);
        GeneratedHttpServiceInterface generatedHttpServiceInterface = httpServiceInterfaceGenerator.generate();
        TypeSpec.Builder serviceClientBuilder = TypeSpec.classBuilder(generatedServiceClientClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(FieldSpec.builder(
                                generatedHttpServiceInterface.className(),
                                SERVICE_FIELD_NAME,
                                Modifier.PRIVATE,
                                Modifier.FINAL)
                        .build())
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(String.class, "url")
                        .addStatement(
                                "this.$L = $T.$L($L)",
                                SERVICE_FIELD_NAME,
                                generatedHttpServiceInterface.className(),
                                HttpServiceInterfaceGenerator.GET_CLIENT_METHOD_NAME,
                                "url")
                        .build());

        List<GeneratedEndpointClient> endpointFiles = new ArrayList<>();
        for (HttpEndpoint httpEndpoint : httpService.endpoints()) {
            MethodSpec interfaceMethod =
                    generatedHttpServiceInterface.endpointMethods().get(httpEndpoint.endpointId());
            MethodSpec.Builder endpointMethodBuilder =
                    MethodSpec.methodBuilder(httpEndpoint.endpointId().value()).addModifiers(Modifier.PUBLIC);
            if (interfaceMethod.parameters.size() <= 1) {
                generateCallWithNoWrappedRequest(interfaceMethod, endpointMethodBuilder);
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

    private void generateCallWithNoWrappedRequest(
            MethodSpec interfaceMethod, MethodSpec.Builder endpointMethodBuilder) {
        List<ParameterSpec> parametersWithoutAnnotations = interfaceMethod.parameters.stream()
                .map(interfaceParameter -> ParameterSpec.builder(interfaceParameter.type, interfaceParameter.name)
                        .build())
                .collect(Collectors.toList());
        endpointMethodBuilder.addParameters(parametersWithoutAnnotations);
        String joinedParameters = interfaceMethod.parameters.stream()
                .map(parameterSpec -> parameterSpec.name)
                .collect(Collectors.joining(", "));
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
        String args = generatedEndpointFile.generatedRequestInfo().propertyMethodSpecs().stream()
                .map(requestMethodSpec -> REQUEST_PARAMETER_NAME + "." + requestMethodSpec.name + "()")
                .collect(Collectors.joining(", "));
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
                .getClassNameFromEndpointId(httpService.name(), httpEndpoint.endpointId(), PackageType.CLIENT);
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
        List<ParameterSpec> endpointParameters = HttpEndpointArgumentUtils.getHttpEndpointArguments(
                httpService, httpEndpoint, generatorContext, generatedEndpointModels);
        List<MethodSpec> parameterImmutablesMethods = endpointParameters.stream()
                .map(endpointParameter -> MethodSpec.methodBuilder(endpointParameter.name)
                        .returns(endpointParameter.type)
                        .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                        .build())
                .collect(Collectors.toList());
        TypeSpec typeSpec = TypeSpec.interfaceBuilder(requestClassName)
                .addAnnotation(Value.Immutable.class)
                .addAnnotation(StagedBuilderImmutablesStyle.class)
                .addMethods(parameterImmutablesMethods)
                .addMethod(generateStaticBuilder(immutablesEndpointClassName))
                .build();
        return GeneratedRequestInfo.builder()
                .requestTypeSpec(typeSpec)
                .requestClassName(endpointClassName.nestedClass(REQUEST_CLASS_NAME))
                .addAllPropertyMethodSpecs(parameterImmutablesMethods)
                .build();
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
