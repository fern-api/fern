package com.fern.jersey.server;

import com.fern.codegen.GeneratedException;
import com.fern.codegen.GeneratedHttpServiceServer;
import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.jersey.JerseyServiceGeneratorUtils;
import com.fern.model.codegen.Generator;
import com.services.http.HttpService;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import com.types.NamedType;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import javax.ws.rs.Consumes;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.apache.commons.lang3.StringUtils;

public final class HttpServiceServerGenerator extends Generator {

    private final HttpService httpService;
    private final ClassName generatedServiceClassName;
    private final JerseyServiceGeneratorUtils jerseyServiceGeneratorUtils;

    public HttpServiceServerGenerator(
            GeneratorContext generatorContext,
            Map<NamedType, GeneratedInterface> generatedInterfaces,
            List<GeneratedException> generatedExceptions,
            HttpService httpService) {
        super(generatorContext, PackageType.SERVICES);
        this.httpService = httpService;
        this.generatedServiceClassName =
                generatorContext.getClassNameUtils().getClassNameForNamedType(httpService.name(), packageType);
        this.jerseyServiceGeneratorUtils = new JerseyServiceGeneratorUtils(
                generatorContext, generatedInterfaces, generatedExceptions, httpService);
    }

    @Override
    public GeneratedHttpServiceServer generate() {
        TypeSpec.Builder jerseyServiceBuilder = TypeSpec.interfaceBuilder(
                        generatedServiceClassName)
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
                .map(httpEndpoint -> jerseyServiceGeneratorUtils.getHttpEndpointMethodSpec(httpEndpoint, false))
                .collect(Collectors.toList());
        TypeSpec jerseyServiceTypeSpec =
                jerseyServiceBuilder.addMethods(httpEndpointMethods).build();
        JavaFile jerseyServiceJavaFile = JavaFile.builder(
                        generatedServiceClassName.packageName(), jerseyServiceTypeSpec)
                .build();
        return GeneratedHttpServiceServer.builder()
                .file(jerseyServiceJavaFile)
                .className(generatedServiceClassName)
                .httpService(httpService)
                .addAllGeneratedWireMessages(jerseyServiceGeneratorUtils.getGeneratedWireMessages())
                .build();
    }
}
