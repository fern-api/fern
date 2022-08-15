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

import com.fern.codegen.GeneratedEndpointModel;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratedErrorDecoder;
import com.fern.codegen.GeneratedHttpServiceInterface;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameConstants;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.codegen.utils.server.HttpPathUtils;
import com.fern.java.exception.UnknownRemoteException;
import com.fern.java.jersey.contracts.OptionalAwareContract;
import com.fern.jersey.JerseyHttpMethodAnnotationVisitor;
import com.fern.jersey.JerseyServiceGeneratorUtils;
import com.fern.model.codegen.Generator;
import com.fern.types.ErrorName;
import com.fern.types.services.EndpointId;
import com.fern.types.services.HttpEndpoint;
import com.fern.types.services.HttpService;
import com.palantir.common.streams.KeyedStream;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeSpec;
import feign.Feign;
import feign.jackson.JacksonDecoder;
import feign.jackson.JacksonEncoder;
import feign.jaxrs.JAXRSContract;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import javax.ws.rs.Consumes;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

public final class HttpServiceInterfaceGenerator extends Generator {

    public static final String GET_CLIENT_METHOD_NAME = "getClient";

    private final HttpService httpService;
    private final ClassName generatedServiceClassName;
    private final Map<ErrorName, GeneratedError> generatedErrors;
    private final JerseyServiceGeneratorUtils jerseyServiceGeneratorUtils;
    private final Map<EndpointId, GeneratedEndpointModel> generatedEndpointModels;

    public HttpServiceInterfaceGenerator(
            GeneratorContext generatorContext,
            Map<EndpointId, GeneratedEndpointModel> generatedEndpointModels,
            Map<ErrorName, GeneratedError> generatedErrors,
            HttpService httpService) {
        super(generatorContext);
        this.httpService = httpService;
        this.generatedServiceClassName = generatorContext
                .getClassNameUtils()
                .getClassNameFromServiceName(httpService.name(), PackageType.CLIENT);
        this.jerseyServiceGeneratorUtils = new JerseyServiceGeneratorUtils(generatorContext);
        this.generatedEndpointModels = generatedEndpointModels;
        this.generatedErrors = generatedErrors;
    }

    @Override
    public GeneratedHttpServiceInterface generate() {
        TypeSpec.Builder jerseyServiceBuilder = TypeSpec.interfaceBuilder(generatedServiceClassName)
                .addAnnotation(AnnotationSpec.builder(Consumes.class)
                        .addMember("value", "$T.APPLICATION_JSON", MediaType.class)
                        .build())
                .addAnnotation(AnnotationSpec.builder(Produces.class)
                        .addMember("value", "$T.APPLICATION_JSON", MediaType.class)
                        .build());
        jerseyServiceBuilder.addAnnotation(AnnotationSpec.builder(Path.class)
                .addMember("value", "$S", httpService.basePath().orElse("/"))
                .build());
        Map<EndpointId, MethodSpec> httpEndpointMethods = httpService.endpoints().stream()
                .collect(Collectors.toMap(
                        HttpEndpoint::endpointId,
                        this::getHttpEndpointMethodSpec,
                        (u, _v) -> {
                            throw new IllegalStateException(String.format("Duplicate key %s", u));
                        },
                        LinkedHashMap::new));
        Optional<GeneratedErrorDecoder> maybeGeneratedErrorDecoder = getGeneratedErrorDecoder();
        TypeSpec jerseyServiceTypeSpec = jerseyServiceBuilder
                .addMethods(httpEndpointMethods.values())
                .addMethod(getStaticClientBuilderMethod(maybeGeneratedErrorDecoder))
                .build();
        JavaFile jerseyServiceJavaFile = JavaFile.builder(
                        generatedServiceClassName.packageName(), jerseyServiceTypeSpec)
                .build();
        return GeneratedHttpServiceInterface.builder()
                .file(jerseyServiceJavaFile)
                .className(generatedServiceClassName)
                .httpService(httpService)
                .generatedErrorDecoder(maybeGeneratedErrorDecoder)
                .putAllEndpointMethods(httpEndpointMethods)
                .build();
    }

    private MethodSpec getHttpEndpointMethodSpec(HttpEndpoint httpEndpoint) {
        MethodSpec.Builder endpointMethodBuilder = MethodSpec.methodBuilder(
                        httpEndpoint.endpointId().value())
                .addAnnotation(httpEndpoint.method().visit(JerseyHttpMethodAnnotationVisitor.INSTANCE))
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT);
        endpointMethodBuilder.addAnnotation(AnnotationSpec.builder(Path.class)
                .addMember("value", "$S", HttpPathUtils.getPathWithCurlyBracedPathParams(httpEndpoint.path()))
                .build());

        List<ParameterSpec> endpointParameters = HttpEndpointArgumentUtils.getHttpEndpointArguments(
                httpService, httpEndpoint, generatorContext, generatedEndpointModels);
        endpointMethodBuilder.addParameters(endpointParameters);

        GeneratedEndpointModel generatedEndpointModel = generatedEndpointModels.get(httpEndpoint.endpointId());
        jerseyServiceGeneratorUtils
                .getPayloadTypeName(generatedEndpointModel.generatedHttpResponse())
                .ifPresent(endpointMethodBuilder::returns);

        List<ClassName> errorClassNames = httpEndpoint.errors().value().stream()
                .map(responseError -> generatedErrors.get(responseError.error()).className())
                .collect(Collectors.toList());
        endpointMethodBuilder.addExceptions(errorClassNames);
        if (!errorClassNames.isEmpty()) {
            endpointMethodBuilder.addException(ClassName.get(UnknownRemoteException.class));
        }
        return endpointMethodBuilder.build();
    }

    private Optional<GeneratedErrorDecoder> getGeneratedErrorDecoder() {
        Optional<GeneratedErrorDecoder> maybeGeneratedErrorDecoder = Optional.empty();
        boolean shouldGenerateErrorDecoder = httpService.endpoints().stream()
                        .flatMap(httpEndpoint -> httpEndpoint.errors().value().stream())
                        .count()
                > 0;
        if (shouldGenerateErrorDecoder) {
            ServiceErrorDecoderGenerator serviceErrorDecoderGenerator = new ServiceErrorDecoderGenerator(
                    generatorContext,
                    httpService,
                    KeyedStream.stream(generatedEndpointModels)
                            .map(GeneratedEndpointModel::errorFile)
                            .collectToMap());
            maybeGeneratedErrorDecoder = Optional.of(serviceErrorDecoderGenerator.generate());
        }
        return maybeGeneratedErrorDecoder;
    }

    private MethodSpec getStaticClientBuilderMethod(Optional<GeneratedErrorDecoder> generatedErrorDecoder) {
        CodeBlock.Builder codeBlockBuilder = CodeBlock.builder()
                .add("return $T.builder()\n", Feign.class)
                .indent()
                .indent()
                .add(".contract(new $T(new $T()))\n", OptionalAwareContract.class, JAXRSContract.class)
                .add(
                        ".decoder(new $T($T.$L))\n",
                        JacksonDecoder.class,
                        ClassNameConstants.CLIENT_OBJECT_MAPPERS_CLASS_NAME,
                        ClassNameConstants.CLIENT_OBJECT_MAPPERS_JSON_MAPPER_FIELD_NAME)
                .add(
                        ".encoder(new $T($T.$L))\n",
                        JacksonEncoder.class,
                        ClassNameConstants.CLIENT_OBJECT_MAPPERS_CLASS_NAME,
                        ClassNameConstants.CLIENT_OBJECT_MAPPERS_JSON_MAPPER_FIELD_NAME);
        if (generatedErrorDecoder.isPresent()) {
            codeBlockBuilder.add(
                    ".errorDecoder(new $T())", generatedErrorDecoder.get().className());
        }
        codeBlockBuilder.add(".target($T.class, $L);", generatedServiceClassName, "url");
        CodeBlock codeBlock = codeBlockBuilder.unindent().unindent().build();
        return MethodSpec.methodBuilder(GET_CLIENT_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addParameter(ClassNameConstants.STRING_CLASS_NAME, "url")
                .returns(generatedServiceClassName)
                .addCode(codeBlock)
                .build();
    }
}
