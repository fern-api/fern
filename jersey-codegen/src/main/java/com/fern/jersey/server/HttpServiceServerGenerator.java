package com.fern.jersey.server;

import com.fern.codegen.GeneratedEndpointError;
import com.fern.codegen.GeneratedEndpointModel;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratedHttpServiceServer;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.jersey.HttpAuthToParameterSpec;
import com.fern.jersey.HttpMethodAnnotationVisitor;
import com.fern.jersey.JerseyServiceGeneratorUtils;
import com.fern.model.codegen.Generator;
import com.fern.types.services.http.HttpEndpoint;
import com.fern.types.services.http.HttpService;
import com.fern.types.types.NamedType;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.lang.model.element.Modifier;
import javax.ws.rs.Consumes;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

public final class HttpServiceServerGenerator extends Generator {

    private final HttpService httpService;
    private final ClassName generatedServiceClassName;
    private final JerseyServiceGeneratorUtils jerseyServiceGeneratorUtils;
    private final Map<HttpEndpoint, GeneratedEndpointModel> generatedEndpointModels;
    private final Map<NamedType, GeneratedError> generatedErrors;

    public HttpServiceServerGenerator(
            GeneratorContext generatorContext,
            Map<NamedType, GeneratedError> generatedErrors,
            List<GeneratedEndpointModel> generatedEndpointModels,
            HttpService httpService) {
        super(generatorContext, PackageType.SERVER);
        this.httpService = httpService;
        this.generatedErrors = generatedErrors;
        this.generatedServiceClassName =
                generatorContext.getClassNameUtils().getClassNameForNamedType(httpService.name(), packageType);
        this.jerseyServiceGeneratorUtils = new JerseyServiceGeneratorUtils(generatorContext);
        this.generatedEndpointModels = generatedEndpointModels.stream()
                .collect(Collectors.toMap(GeneratedEndpointModel::httpEndpoint, Function.identity()));
    }

    @Override
    public GeneratedHttpServiceServer generate() {
        TypeSpec.Builder jerseyServiceBuilder = TypeSpec.classBuilder(generatedServiceClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .addAnnotation(AnnotationSpec.builder(Consumes.class)
                        .addMember("value", "$T.APPLICATION_JSON", MediaType.class)
                        .build())
                .addAnnotation(AnnotationSpec.builder(Produces.class)
                        .addMember("value", "$T.APPLICATION_JSON", MediaType.class)
                        .build());
        if (httpService.basePath().isPresent()) {
            jerseyServiceBuilder.addAnnotation(AnnotationSpec.builder(Path.class)
                    .addMember("value", "$S", httpService.basePath().get())
                    .build());
        }
        List<MethodSpec> httpEndpointMethods = httpService.endpoints().stream()
                .map(this::getHttpEndpointMethodSpec)
                .flatMap(httpEndpointServerMethods ->
                        Stream.of(httpEndpointServerMethods.endpointMethod, httpEndpointServerMethods.implMethod))
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
                .build();
    }

    private HttpEndpointServerMethods getHttpEndpointMethodSpec(HttpEndpoint httpEndpoint) {
        MethodSpec.Builder endpointMethodBuilder = MethodSpec.methodBuilder(httpEndpoint.endpointId())
                .addAnnotation(httpEndpoint.method().visit(HttpMethodAnnotationVisitor.INSTANCE))
                .addAnnotation(AnnotationSpec.builder(Path.class)
                        .addMember("value", "$S", httpEndpoint.path())
                        .build())
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL);
        httpEndpoint
                .auth()
                .visit(new HttpAuthToParameterSpec(generatorContext))
                .ifPresent(endpointMethodBuilder::addParameter);
        httpEndpoint.headers().stream()
                .map(jerseyServiceGeneratorUtils::getHeaderParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.pathParameters().stream()
                .map(jerseyServiceGeneratorUtils::getPathParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.queryParameters().stream()
                .map(jerseyServiceGeneratorUtils::getQueryParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        GeneratedEndpointModel generatedEndpointModel = generatedEndpointModels.get(httpEndpoint);
        jerseyServiceGeneratorUtils
                .getPayloadTypeName(generatedEndpointModel.generatedHttpRequest())
                .ifPresent(typeName -> {
                    endpointMethodBuilder.addParameter(
                            ParameterSpec.builder(typeName, "request").build());
                });
        Optional<TypeName> returnPayload =
                jerseyServiceGeneratorUtils.getPayloadTypeName(generatedEndpointModel.generatedHttpResponse());
        returnPayload.ifPresent(endpointMethodBuilder::returns);

        boolean errorsPresent = httpEndpoint.response().failed().errors().size() > 0;

        String endpointImplMethodName = httpEndpoint.endpointId() + "Impl";
        MethodSpec.Builder endpointImplMethodBuilder =
                MethodSpec.methodBuilder(endpointImplMethodName).addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT);

        CodeBlock.Builder endpointMethodCodeBlock = CodeBlock.builder();

        if (errorsPresent && generatedEndpointModel.errorFile().isPresent()) {
            GeneratedEndpointError generatedEndpointError =
                    generatedEndpointModel.errorFile().get();
            endpointMethodCodeBlock
                    .beginControlFlow("try")
                    .add(getImplCall(endpointImplMethodName, returnPayload, endpointMethodBuilder))
                    .endControlFlow();
            httpEndpoint.response().failed().errors().forEach(responseError -> {
                GeneratedError generatedError = generatedErrors.get(responseError.error());
                endpointMethodCodeBlock
                        .beginControlFlow("catch ($T e)", generatedError.className())
                        .addStatement(
                                "throw $T.$L(e)",
                                generatedEndpointError.className(),
                                generatedEndpointError
                                        .constructorsByResponseError()
                                        .get(responseError)
                                        .name)
                        .endControlFlow();
                endpointImplMethodBuilder.addException(generatedError.className());
            });
        } else {
            endpointMethodCodeBlock.add(getImplCall(endpointImplMethodName, returnPayload, endpointMethodBuilder));
        }

        MethodSpec endpointMethod =
                endpointMethodBuilder.addCode(endpointMethodCodeBlock.build()).build();
        MethodSpec implMethod = endpointImplMethodBuilder
                .addParameters(endpointMethod.parameters.stream()
                        .map(parameterSpec -> ParameterSpec.builder(parameterSpec.type, parameterSpec.name)
                                .build())
                        .collect(Collectors.toList()))
                .returns(endpointMethod.returnType)
                .build();
        return new HttpEndpointServerMethods(endpointMethod, implMethod);
    }

    private CodeBlock getImplCall(
            String endpointImplMethodName, Optional<TypeName> returnPayload, MethodSpec.Builder endpointMethodBuilder) {
        CodeBlock.Builder implCallBuilder = CodeBlock.builder();
        String args =
                endpointMethodBuilder.parameters.stream().map(_unused -> "$L").collect(Collectors.joining());
        String argNames = endpointMethodBuilder.parameters.stream()
                .map(parameterSpec -> parameterSpec.name)
                .collect(Collectors.joining());
        if (returnPayload.isPresent()) {
            implCallBuilder.addStatement("return " + endpointImplMethodName + "(" + args + ")", argNames);
        } else {
            implCallBuilder.addStatement(endpointImplMethodName + "(" + args + ")", argNames);
        }
        return implCallBuilder.build();
    }

    private static final class HttpEndpointServerMethods {

        private final MethodSpec endpointMethod;
        private final MethodSpec implMethod;

        HttpEndpointServerMethods(MethodSpec endpointMethod, MethodSpec implMethod) {
            this.endpointMethod = endpointMethod;
            this.implMethod = implMethod;
        }

        public MethodSpec getEndpointMethod() {
            return endpointMethod;
        }

        public MethodSpec getImplMethod() {
            return implMethod;
        }
    }
}
