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
import com.fern.codegen.Generator;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.IGeneratedFile;
import com.fern.codegen.generator.object.EnrichedObjectProperty;
import com.fern.codegen.generator.object.GenericObjectGenerator;
import com.fern.types.DeclaredErrorName;
import com.fern.types.services.HttpEndpoint;
import com.fern.types.services.HttpService;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.apache.commons.lang3.StringUtils;

public final class HttpEndpointGenerator extends Generator {

    private static final String REQUEST_CLASS_NAME = "Request";
    private static final String ERROR_CLASS_NAME = "Error";
    private static final String AUTH_REQUEST_PARAMETER = "authOverride";
    private final HttpEndpoint httpEndpoint;
    private final ClassName endpointClassName;
    private final List<ParameterSpec> serviceInterfaceMethodParameters;
    private final Optional<GeneratedAuthSchemes> maybeGeneratedAuthSchemes;
    private final Map<DeclaredErrorName, IGeneratedFile> generatedClientErrors;

    public HttpEndpointGenerator(
            GeneratorContext generatorContext,
            ClientClassNameUtils clientClassNameUtils,
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            List<ParameterSpec> serviceInterfaceMethodParameters,
            Optional<GeneratedAuthSchemes> maybeGeneratedAuthSchemes,
            Map<DeclaredErrorName, IGeneratedFile> generatedClientErrors) {
        super(generatorContext);
        this.httpEndpoint = httpEndpoint;
        this.endpointClassName = clientClassNameUtils.getClassName(httpService.name(), httpEndpoint.id());
        this.serviceInterfaceMethodParameters = serviceInterfaceMethodParameters;
        this.maybeGeneratedAuthSchemes = maybeGeneratedAuthSchemes;
        this.generatedClientErrors = generatedClientErrors;
    }

    @Override
    public GeneratedEndpointClient generate() {
        TypeSpec.Builder endpointTypeSpecBuilder = TypeSpec.classBuilder(endpointClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .build());
        GeneratedRequestInfo generatedRequestInfo = generateNestedRequestType();
        endpointTypeSpecBuilder.addType(generatedRequestInfo.requestTypeSpec());
        TypeSpec endpointTypeSpec = endpointTypeSpecBuilder.build();
        JavaFile endpointJavaFile = JavaFile.builder(endpointClassName.packageName(), endpointTypeSpec)
                .build();
        return GeneratedEndpointClient.builder()
                .file(endpointJavaFile)
                .className(endpointClassName)
                .generatedNestedRequest(generatedRequestInfo)
                .build();
    }

    private GeneratedRequestInfo generateNestedRequestType() {
        ClassName requestClassName = endpointClassName.nestedClass(REQUEST_CLASS_NAME);
        List<EnrichedObjectProperty> enrichedObjectProperties = getRequestParameters().stream()
                .map(parameterSpec -> EnrichedObjectProperty.builder()
                        .camelCaseKey(parameterSpec.name)
                        .pascalCaseKey(StringUtils.capitalize(parameterSpec.name))
                        .poetTypeName(parameterSpec.type)
                        .fromInterface(false)
                        .build())
                .collect(Collectors.toList());
        GenericObjectGenerator genericObjectGenerator = new GenericObjectGenerator(
                requestClassName,
                enrichedObjectProperties,
                Collections.emptyList(),
                false,
                Optional.of(endpointClassName));
        TypeSpec requestTypeSpec = genericObjectGenerator.generate();
        Optional<MethodSpec> authMethodSpec = Optional.empty();
        if (httpEndpoint.auth() && maybeGeneratedAuthSchemes.isPresent()) {
            authMethodSpec = Optional.of(enrichedObjectProperties.get(0).getterProperty());
        }
        return GeneratedRequestInfo.builder()
                .requestTypeSpec(requestTypeSpec)
                .requestClassName(requestClassName)
                .authMethodSpec(authMethodSpec)
                .addAllEnrichedObjectProperty(enrichedObjectProperties)
                .build();
    }

    private List<ParameterSpec> getRequestParameters() {
        List<ParameterSpec> requestParameters = new ArrayList<>();
        if (httpEndpoint.auth() && maybeGeneratedAuthSchemes.isPresent()) {
            GeneratedAuthSchemes generatedAuthSchemes = maybeGeneratedAuthSchemes.get();
            requestParameters.add(ParameterSpec.builder(
                            ParameterizedTypeName.get(ClassName.get(Optional.class), generatedAuthSchemes.className()),
                            AUTH_REQUEST_PARAMETER)
                    .build());
            for (int i = generatedAuthSchemes.generatedAuthSchemes().size();
                    i < serviceInterfaceMethodParameters.size();
                    ++i) {
                requestParameters.add(serviceInterfaceMethodParameters.get(i));
            }
        } else {
            requestParameters.addAll(serviceInterfaceMethodParameters);
        }
        return requestParameters;
    }
}
