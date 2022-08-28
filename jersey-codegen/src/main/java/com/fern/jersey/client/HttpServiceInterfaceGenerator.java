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
import com.fern.codegen.GeneratedEndpointModel;
import com.fern.codegen.GeneratedErrorDecoder;
import com.fern.codegen.GeneratedHttpServiceInterface;
import com.fern.codegen.Generator;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.IGeneratedFile;
import com.fern.codegen.utils.ClassNameConstants;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.codegen.utils.HttpPathUtils;
import com.fern.ir.model.errors.DeclaredErrorName;
import com.fern.ir.model.services.http.HttpEndpoint;
import com.fern.ir.model.services.http.HttpEndpointId;
import com.fern.ir.model.services.http.HttpService;
import com.fern.java.jersey.contracts.OptionalAwareContract;
import com.fern.jersey.JerseyHttpMethodAnnotationVisitor;
import com.fern.jersey.JerseyServiceGeneratorUtils;
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
import java.util.Collections;
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
import org.immutables.value.Value;

public final class HttpServiceInterfaceGenerator extends Generator {

    public static final String GET_CLIENT_METHOD_NAME = "getClient";

    private final HttpService httpService;
    private final ClassName generatedServiceClassName;
    private final Map<DeclaredErrorName, IGeneratedFile> generatedErrors;
    private final JerseyServiceGeneratorUtils jerseyServiceGeneratorUtils;
    private final Map<HttpEndpointId, GeneratedEndpointModel> generatedEndpointModels;
    private final Optional<GeneratedAuthSchemes> maybeGeneratedAuthSchemes;
    private final ClientClassNameUtils clientClassNameUtils;

    public HttpServiceInterfaceGenerator(
            GeneratorContext generatorContext,
            Map<HttpEndpointId, GeneratedEndpointModel> generatedEndpointModels,
            Map<DeclaredErrorName, IGeneratedFile> generatedErrors,
            Optional<GeneratedAuthSchemes> maybeGeneratedAuthSchemes,
            HttpService httpService) {
        super(generatorContext);
        this.httpService = httpService;
        this.generatedServiceClassName = generatorContext
                .getClassNameUtils()
                .getClassNameFromServiceName(httpService.getName(), PackageType.CLIENT);
        this.jerseyServiceGeneratorUtils = new JerseyServiceGeneratorUtils(generatorContext);
        this.generatedEndpointModels = generatedEndpointModels;
        this.generatedErrors = generatedErrors;
        this.maybeGeneratedAuthSchemes = maybeGeneratedAuthSchemes;
        this.clientClassNameUtils =
                new ClientClassNameUtils(generatorContext.getIr(), generatorContext.getOrganization());
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
                .addMember("value", "$S", httpService.getBasePath().orElse("/"))
                .build());
        Map<HttpEndpointId, MethodSpecAndEndpointClient> httpEndpointInfos = httpService.getEndpoints().stream()
                .collect(Collectors.toMap(
                        HttpEndpoint::getId,
                        this::getHttpEndpointMethodSpec,
                        (u, _v) -> {
                            throw new IllegalStateException(String.format("Duplicate key %s", u));
                        },
                        LinkedHashMap::new));
        Map<HttpEndpointId, MethodSpec> httpEndpointMethods = KeyedStream.stream(httpEndpointInfos)
                .map(MethodSpecAndEndpointClient::methodSpec)
                .collectToMap();
        Map<HttpEndpointId, Optional<GeneratedEndpointClient>> endpointFiles = KeyedStream.stream(httpEndpointInfos)
                .map(MethodSpecAndEndpointClient::endpointClient)
                .collectToMap();
        Map<HttpEndpointId, IGeneratedFile> endpointExceptions = KeyedStream.stream(httpEndpointInfos)
                .map(MethodSpecAndEndpointClient::endpointException)
                .collectToMap();
        GeneratedErrorDecoder maybeGeneratedErrorDecoder = getGeneratedErrorDecoder(endpointExceptions);
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
                .putAllEndpointFiles(endpointFiles)
                .putAllEndpointMethods(httpEndpointMethods)
                .putAllEndpointExceptions(endpointExceptions)
                .build();
    }

    private MethodSpecAndEndpointClient getHttpEndpointMethodSpec(HttpEndpoint httpEndpoint) {
        MethodSpec.Builder endpointMethodBuilder = MethodSpec.methodBuilder(
                        httpEndpoint.getId().get())
                .addAnnotation(httpEndpoint.getMethod().visit(JerseyHttpMethodAnnotationVisitor.INSTANCE))
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT);
        endpointMethodBuilder.addAnnotation(AnnotationSpec.builder(Path.class)
                .addMember("value", "$S", HttpPathUtils.getPathWithCurlyBracedPathParams(httpEndpoint.getPath()))
                .build());

        List<ParameterSpec> endpointParameters = HttpEndpointArgumentUtils.getHttpEndpointArguments(
                httpService,
                httpEndpoint,
                generatorContext,
                generatedEndpointModels,
                maybeGeneratedAuthSchemes
                        .map(GeneratedAuthSchemes::generatedAuthSchemes)
                        .orElseGet(Collections::emptyMap));
        endpointMethodBuilder.addParameters(endpointParameters);

        GeneratedEndpointModel generatedEndpointModel = generatedEndpointModels.get(httpEndpoint.getId());
        jerseyServiceGeneratorUtils
                .getPayloadTypeName(generatedEndpointModel.generatedHttpResponse())
                .ifPresent(endpointMethodBuilder::returns);

        ImmutableMethodSpecAndEndpointClient.Builder resultBuilder = MethodSpecAndEndpointClient.builder();
        if (!endpointParameters.isEmpty()) {
            GeneratedEndpointClient generatedEndpointClient =
                    generateEndpointFile(httpEndpoint, endpointMethodBuilder.parameters);
            resultBuilder.endpointClient(generatedEndpointClient);
        }
        IGeneratedFile generateEndpointException = generateEndpointException(httpEndpoint);
        MethodSpec serviceInterfaceMethodSpec = endpointMethodBuilder
                .addException(generateEndpointException.className())
                .build();
        return resultBuilder
                .methodSpec(serviceInterfaceMethodSpec)
                .endpointException(generateEndpointException)
                .build();
    }

    private GeneratedEndpointClient generateEndpointFile(
            HttpEndpoint httpEndpoint, List<ParameterSpec> serviceInterfaceMethodParameters) {
        HttpEndpointGenerator httpEndpointGenerator = new HttpEndpointGenerator(
                generatorContext,
                clientClassNameUtils,
                httpService,
                httpEndpoint,
                serviceInterfaceMethodParameters,
                maybeGeneratedAuthSchemes,
                generatedErrors);
        return httpEndpointGenerator.generate();
    }

    private IGeneratedFile generateEndpointException(HttpEndpoint httpEndpoint) {
        HttpEndpointExceptionGenerator httpEndpointExceptionGenerator =
                new HttpEndpointExceptionGenerator(generatorContext, httpService, httpEndpoint, generatedErrors);
        return httpEndpointExceptionGenerator.generate();
    }

    private GeneratedErrorDecoder getGeneratedErrorDecoder(Map<HttpEndpointId, IGeneratedFile> endpointExceptions) {
        ServiceErrorDecoderGenerator serviceErrorDecoderGenerator =
                new ServiceErrorDecoderGenerator(generatorContext, httpService, endpointExceptions);
        return serviceErrorDecoderGenerator.generate();
    }

    private MethodSpec getStaticClientBuilderMethod(GeneratedErrorDecoder generatedErrorDecoder) {
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
                        ClassNameConstants.CLIENT_OBJECT_MAPPERS_JSON_MAPPER_FIELD_NAME)
                .add(".errorDecoder(new $T())", generatedErrorDecoder.className());
        codeBlockBuilder.add(".target($T.class, $L);", generatedServiceClassName, "url");
        CodeBlock codeBlock = codeBlockBuilder.unindent().unindent().build();
        return MethodSpec.methodBuilder(GET_CLIENT_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addParameter(ClassNameConstants.STRING_CLASS_NAME, "url")
                .returns(generatedServiceClassName)
                .addCode(codeBlock)
                .build();
    }

    @Value.Immutable
    interface MethodSpecAndEndpointClient {
        MethodSpec methodSpec();

        Optional<GeneratedEndpointClient> endpointClient();

        IGeneratedFile endpointException();

        static ImmutableMethodSpecAndEndpointClient.Builder builder() {
            return ImmutableMethodSpecAndEndpointClient.builder();
        }
    }
}
