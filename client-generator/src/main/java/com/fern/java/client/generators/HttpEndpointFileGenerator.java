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

package com.fern.java.client.generators;

import com.fern.ir.model.errors.DeclaredErrorName;
import com.fern.ir.model.services.http.HttpEndpoint;
import com.fern.ir.model.services.http.HttpService;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedEndpointRequest;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.generators.object.ObjectTypeSpecGenerator;
import com.fern.java.output.GeneratedAuthFiles;
import com.fern.java.output.GeneratedJavaFile;
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

public final class HttpEndpointFileGenerator extends AbstractFileGenerator {

    private static final String REQUEST_CLASS_NAME = "Request";

    private static final String AUTH_REQUEST_PARAMETER_CAMEL_CASE = "authOverride";
    private static final String AUTH_REQUEST_PARAMETER_PASCAL_CASE = "AuthOverride";

    private final HttpEndpoint httpEndpoint;
    private final List<ParameterSpec> parametersToInclude;

    private final Optional<GeneratedAuthFiles> maybeAuth;
    private final Map<DeclaredErrorName, GeneratedJavaFile> generatedErrors;

    public HttpEndpointFileGenerator(
            ClientGeneratorContext generatorContext,
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            List<ParameterSpec> parametersToInclude,
            Optional<GeneratedAuthFiles> maybeAuth,
            Map<DeclaredErrorName, GeneratedJavaFile> generatedErrors) {
        super(
                generatorContext.getPoetClassNameFactory().getEndpointClassName(httpService.getName(), httpEndpoint),
                generatorContext);
        this.httpEndpoint = httpEndpoint;
        this.parametersToInclude = parametersToInclude;
        this.maybeAuth = maybeAuth;
        this.generatedErrors = generatedErrors;
    }

    @Override
    public GeneratedEndpointRequest generateFile() {
        GeneratedEndpointRequest.Builder outputBuilder = GeneratedEndpointRequest.builder();
        TypeSpec.Builder endpointTypeSpecBuilder = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .build());
        endpointTypeSpecBuilder.addType(generateNestedRequestType(outputBuilder));
        TypeSpec endpointTypeSpec = endpointTypeSpecBuilder.build();
        JavaFile endpointJavaFile =
                JavaFile.builder(className.packageName(), endpointTypeSpec).build();
        return outputBuilder.className(className).javaFile(endpointJavaFile).build();
    }

    private TypeSpec generateNestedRequestType(GeneratedEndpointRequest.Builder outputBuilder) {
        ClassName requestClassName = className.nestedClass(REQUEST_CLASS_NAME);
        List<EnrichedObjectProperty> enrichedObjectProperties = parametersToInclude.stream()
                .map(parameterSpec -> EnrichedObjectProperty.builder()
                        .camelCaseKey(parameterSpec.name)
                        .pascalCaseKey(StringUtils.capitalize(parameterSpec.name))
                        .poetTypeName(parameterSpec.type)
                        .fromInterface(false)
                        .build())
                .collect(Collectors.toList());
        Optional<EnrichedObjectProperty> maybeAuthProperty = Optional.empty();
        if (maybeAuth.isPresent()) {
            maybeAuthProperty = Optional.of(EnrichedObjectProperty.builder()
                    .camelCaseKey(AUTH_REQUEST_PARAMETER_CAMEL_CASE)
                    .pascalCaseKey(AUTH_REQUEST_PARAMETER_PASCAL_CASE)
                    .poetTypeName(ParameterizedTypeName.get(
                            ClassName.get(Optional.class), maybeAuth.get().getClassName()))
                    .fromInterface(false)
                    .build());
            outputBuilder.authMethodSpec(maybeAuthProperty.get().getterProperty());
        }
        List<EnrichedObjectProperty> allProperties = new ArrayList<>();
        allProperties.addAll(enrichedObjectProperties);
        maybeAuthProperty.ifPresent(allProperties::add);

        ObjectTypeSpecGenerator objectTypeSpecGenerator =
                new ObjectTypeSpecGenerator(requestClassName, allProperties, Collections.emptyList(), false);
        TypeSpec requestTypeSpec = objectTypeSpecGenerator.generate();

        outputBuilder
                .requestClassName(requestClassName)
                .addAllNonAuthProperties(enrichedObjectProperties)
                .requestTypeSpec(requestTypeSpec);

        return requestTypeSpec;
    }
}
