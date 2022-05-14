package com.fern.jersey.client;

import com.fern.codegen.GeneratedErrorDecoder;
import com.fern.codegen.GeneratedException;
import com.fern.codegen.GeneratedHttpServiceClient;
import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.stateless.generator.ObjectMapperGenerator;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.jersey.JerseyServiceGeneratorUtils;
import com.fern.model.codegen.Generator;
import com.fern.types.services.http.HttpEndpoint;
import com.fern.types.services.http.HttpResponse;
import com.fern.types.services.http.HttpService;
import com.fern.types.types.NamedType;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import feign.Feign;
import feign.jackson.JacksonDecoder;
import feign.jackson.JacksonEncoder;
import feign.jaxrs.JAXRSContract;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import javax.ws.rs.Consumes;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

public final class HttpServiceClientGenerator extends Generator {

    private static final String CLIENT_CLASS_NAME_SUFFIX = "client";

    private static final String GET_CLIENT_METHOD_NAME = "getClient";

    private final HttpService httpService;
    private final ClassName generatedServiceClassName;
    private final List<GeneratedException> generatedExceptions;
    private final JerseyServiceGeneratorUtils jerseyServiceGeneratorUtils;

    public HttpServiceClientGenerator(
            GeneratorContext generatorContext,
            Map<NamedType, GeneratedInterface> generatedInterfaces,
            List<GeneratedException> generatedExceptions,
            HttpService httpService) {
        super(generatorContext, PackageType.CLIENT);
        this.httpService = httpService;
        this.generatedExceptions = generatedExceptions;
        this.generatedServiceClassName = generatorContext
                .getClassNameUtils()
                .getClassNameForNamedType(httpService.name(), packageType, Optional.of(CLIENT_CLASS_NAME_SUFFIX));
        this.jerseyServiceGeneratorUtils = new JerseyServiceGeneratorUtils(
                generatorContext, generatedInterfaces, generatedExceptions, httpService);
    }

    @Override
    public GeneratedHttpServiceClient generate() {
        TypeSpec.Builder jerseyServiceBuilder = TypeSpec.interfaceBuilder(generatedServiceClassName)
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(AnnotationSpec.builder(Consumes.class)
                        .addMember("value", "$T.APPLICATION_JSON", MediaType.class)
                        .build())
                .addAnnotation(AnnotationSpec.builder(Produces.class)
                        .addMember("value", "$T.APPLICATION_JSON", MediaType.class)
                        .build())
                .addAnnotation(AnnotationSpec.builder(Path.class)
                        .addMember("value", "$S", httpService.basePath())
                        .build());
        List<MethodSpec> httpEndpointMethods = httpService.endpoints().stream()
                .map(httpEndpoint -> jerseyServiceGeneratorUtils.getHttpEndpointMethodSpec(httpEndpoint, true))
                .collect(Collectors.toList());
        Optional<GeneratedErrorDecoder> maybeGeneratedErrorDecoder = getGeneratedErrorDecoder();
        TypeSpec jerseyServiceTypeSpec = jerseyServiceBuilder
                .addMethods(httpEndpointMethods)
                .addMethod(getStaticClientBuilderMethod(maybeGeneratedErrorDecoder))
                .build();
        JavaFile jerseyServiceJavaFile = JavaFile.builder(
                        generatedServiceClassName.packageName(), jerseyServiceTypeSpec)
                .build();
        return GeneratedHttpServiceClient.builder()
                .file(jerseyServiceJavaFile)
                .className(generatedServiceClassName)
                .httpService(httpService)
                .generatedErrorDecoder(maybeGeneratedErrorDecoder)
                .addAllHttpRequests(jerseyServiceGeneratorUtils.getGeneratedHttpRequests())
                .addAllHttpResponses(jerseyServiceGeneratorUtils.getGeneratedHttpResponses())
                .build();
    }

    private Optional<GeneratedErrorDecoder> getGeneratedErrorDecoder() {
        Optional<GeneratedErrorDecoder> maybeGeneratedErrorDecoder = Optional.empty();
        boolean shouldGenerateErrorDecoder = httpService.endpoints().stream()
                        .map(HttpEndpoint::response)
                        .map(HttpResponse::errors)
                        .flatMap(responseErrors -> responseErrors.possibleErrors().stream())
                        .count()
                > 0;
        if (shouldGenerateErrorDecoder) {
            ServiceErrorDecoderGenerator serviceErrorDecoderGenerator =
                    new ServiceErrorDecoderGenerator(generatorContext, httpService, generatedExceptions);
            maybeGeneratedErrorDecoder = Optional.of(serviceErrorDecoderGenerator.generate());
        }
        return maybeGeneratedErrorDecoder;
    }

    private MethodSpec getStaticClientBuilderMethod(Optional<GeneratedErrorDecoder> generatedErrorDecoder) {
        ClassName objectMapperClassName =
                generatorContext.getClientObjectMappersFile().className();
        CodeBlock.Builder codeBlockBuilder = CodeBlock.builder()
                .add("return $T.builder()\n", Feign.class)
                .indent()
                .indent()
                .add(".contract(new $T())\n", JAXRSContract.class)
                .add(
                        ".decoder(new $T($T.$L))\n",
                        JacksonDecoder.class,
                        objectMapperClassName,
                        ObjectMapperGenerator.JSON_MAPPER_FIELD_NAME)
                .add(
                        ".encoder(new $T($T.$L))\n",
                        JacksonEncoder.class,
                        objectMapperClassName,
                        ObjectMapperGenerator.JSON_MAPPER_FIELD_NAME);
        if (generatedErrorDecoder.isPresent()) {
            codeBlockBuilder.add(
                    ".errorDecoder(new $T())", generatedErrorDecoder.get().className());
        }
        codeBlockBuilder.add(".target($T.class, $L);", generatedServiceClassName, "url");
        CodeBlock codeBlock = codeBlockBuilder.unindent().unindent().build();
        return MethodSpec.methodBuilder(GET_CLIENT_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addParameter(ClassNameUtils.STRING_CLASS_NAME, "url")
                .returns(generatedServiceClassName)
                .addCode(codeBlock)
                .build();
    }
}
