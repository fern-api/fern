package com.fern.jersey.client;

import com.fern.codegen.GeneratedEndpointError;
import com.fern.codegen.GeneratedErrorDecoder;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.stateless.generator.ObjectMapperGenerator;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.model.codegen.Generator;
import com.fern.model.codegen.services.payloads.FailedResponseGenerator;
import com.fern.types.services.http.HttpEndpoint;
import com.fern.types.services.http.HttpService;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.TypeVariableName;
import feign.Response;
import feign.codec.ErrorDecoder;
import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import javax.lang.model.element.Modifier;

public final class ServiceErrorDecoderGenerator extends Generator {

    private static final String ERROR_DECODER_CLASSNAME_SUFFIX = "ErrorDecoder";

    private static final ClassName FEIGN_RESPONSE_PARAMETER_TYPE = ClassName.get(Response.class);

    private static final String DECODE_METHOD_NAME = "decode";
    private static final String DECODE_METHOD_KEY_PARAMETER_NAME = "methodKey";
    private static final String DECODE_METHOD_RESPONSE_PARAMETER_NAME = "response";

    private static final String DECODE_EXCEPTION_METHOD_NAME = "decodeException";
    private static final String DECODE_EXCEPTION_RESPONSE_PARAMETER_NAME = "response";
    private static final String DECODE_EXCEPTION_CLAZZ_PARAMETER_NAME = "clazz";
    private static final String DECODE_EXCEPTION_RETRIEVER_PARAMETER_NAME = "exceptionRetriever";

    private final HttpService httpService;
    private final ClassName errorDecoderClassName;
    private final Map<HttpEndpoint, Optional<GeneratedEndpointError>> generatedEndpointErrorFiles;

    public ServiceErrorDecoderGenerator(
            GeneratorContext generatorContext,
            HttpService httpService,
            Map<HttpEndpoint, Optional<GeneratedEndpointError>> generatedEndpointErrorFiles) {
        super(generatorContext, PackageType.CLIENT);
        this.httpService = httpService;
        this.errorDecoderClassName = generatorContext
                .getClassNameUtils()
                .getClassNameFromServiceName(httpService.name(), PackageType.CLIENT, ERROR_DECODER_CLASSNAME_SUFFIX);
        this.generatedEndpointErrorFiles = generatedEndpointErrorFiles;
    }

    @Override
    public GeneratedErrorDecoder generate() {
        TypeSpec errorDecoderTypeSpec = TypeSpec.classBuilder(errorDecoderClassName.simpleName())
                .addModifiers(Modifier.FINAL)
                .addSuperinterface(ErrorDecoder.class)
                .addMethod(getDecodeMethodSpec())
                .addMethod(getDecodeExceptionMethodSpec())
                .build();
        JavaFile errorDecoderServiceFile = JavaFile.builder(errorDecoderClassName.packageName(), errorDecoderTypeSpec)
                .build();
        return GeneratedErrorDecoder.builder()
                .file(errorDecoderServiceFile)
                .className(errorDecoderClassName)
                .build();
    }

    private MethodSpec getDecodeMethodSpec() {
        MethodSpec.Builder decodeMethodSpecBuilder = MethodSpec.methodBuilder(DECODE_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Override.class)
                .returns(Exception.class)
                .addParameter(ClassNameUtils.STRING_CLASS_NAME, DECODE_METHOD_KEY_PARAMETER_NAME)
                .addParameter(FEIGN_RESPONSE_PARAMETER_TYPE, DECODE_METHOD_RESPONSE_PARAMETER_NAME);
        CodeBlock.Builder codeBlockBuilder = CodeBlock.builder();
        boolean ifStatementStarted = false;
        for (HttpEndpoint httpEndpoint : httpService.endpoints()) {
            Optional<GeneratedEndpointError> maybeGeneratedEndpointErrorFile =
                    generatedEndpointErrorFiles.get(httpEndpoint);
            if (maybeGeneratedEndpointErrorFile == null || maybeGeneratedEndpointErrorFile.isEmpty()) {
                continue;
            }
            codeBlockBuilder
                    .beginControlFlow(
                            "$L ($L.contains($S))",
                            ifStatementStarted ? "else if" : "if",
                            DECODE_METHOD_KEY_PARAMETER_NAME,
                            httpEndpoint.endpointId())
                    .addStatement(
                            "return $L($L, $T.class, $T::$L)",
                            DECODE_EXCEPTION_METHOD_NAME,
                            DECODE_METHOD_RESPONSE_PARAMETER_NAME,
                            maybeGeneratedEndpointErrorFile.get().className(),
                            maybeGeneratedEndpointErrorFile.get().className(),
                            FailedResponseGenerator.GET_NESTED_ERROR_METHOD_NAME)
                    .endControlFlow();
        }
        codeBlockBuilder.addStatement(
                "return new $T($S + $L)",
                generatorContext.getUnknownRemoteExceptionFile().className(),
                "Encountered exception for unknown method: ",
                DECODE_METHOD_KEY_PARAMETER_NAME);
        return decodeMethodSpecBuilder.addCode(codeBlockBuilder.build()).build();
    }

    private MethodSpec getDecodeExceptionMethodSpec() {
        TypeVariableName genericReturnType = TypeVariableName.get("T");
        return MethodSpec.methodBuilder(DECODE_EXCEPTION_METHOD_NAME)
                .addModifiers(Modifier.PRIVATE, Modifier.STATIC)
                .addTypeVariable(genericReturnType)
                .returns(ClassNameUtils.EXCEPTION_CLASS_NAME)
                .addParameter(FEIGN_RESPONSE_PARAMETER_TYPE, DECODE_EXCEPTION_RESPONSE_PARAMETER_NAME)
                .addParameter(
                        ParameterizedTypeName.get(ClassName.get(Class.class), genericReturnType),
                        DECODE_EXCEPTION_CLAZZ_PARAMETER_NAME)
                .addParameter(
                        ParameterizedTypeName.get(
                                ClassName.get(Function.class), genericReturnType, ClassNameUtils.EXCEPTION_CLASS_NAME),
                        DECODE_EXCEPTION_RETRIEVER_PARAMETER_NAME)
                .beginControlFlow("try")
                .addStatement(
                        "$T value = $T.$L.readValue($L.body().asInputStream(), $L)",
                        genericReturnType,
                        generatorContext.getClientObjectMappersFile().className(),
                        ObjectMapperGenerator.JSON_MAPPER_FIELD_NAME,
                        DECODE_EXCEPTION_RESPONSE_PARAMETER_NAME,
                        DECODE_EXCEPTION_CLAZZ_PARAMETER_NAME)
                .addStatement("return $L.apply(value)", DECODE_EXCEPTION_RETRIEVER_PARAMETER_NAME)
                .endControlFlow()
                .beginControlFlow("catch ($T e)", ClassName.get(IOException.class))
                .addStatement(
                        "return new $T($S)",
                        generatorContext.getUnknownRemoteExceptionFile().className(),
                        "Failed to read error body")
                .endControlFlow()
                .build();
    }
}
