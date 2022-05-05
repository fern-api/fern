package com.fern.services.jersey.codegen;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.codegen.GeneratedErrorDecoder;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.stateless.generator.ClientObjectMapperGenerator;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.model.codegen.Generator;
import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.Multimap;
import com.palantir.common.streams.KeyedStream;
import com.services.http.HttpEndpoint;
import com.services.http.HttpService;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.TypeVariableName;
import com.types.NamedType;
import feign.Response;
import feign.codec.ErrorDecoder;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.immutables.value.Value;

public final class ServiceErrorDecoderGenerator extends Generator {

    private static final String ERROR_DECODER_CLASSNAME_SUFFIX = "ErrorDecoder";

    private static final ClassName FEIGN_RESPONSE_PARAMETER_TYPE = ClassName.get(Response.class);

    private static final String DECODE_METHOD_NAME = "decode";
    private static final String DECODE_METHOD_KEY_PARAMETER_NAME = "methodKey";
    private static final String DECODE_METHOD_RESPONSE_PARAMETER_NAME = "response";

    private static final String DECODE_EXCEPTION_METHOD_NAME = "decodeException";
    private static final String DECODE_EXCEPTION_RESPONSE_PARAMETER_NAME = "response";
    private static final String DECODE_EXCEPTION_CLAZZ_PARAMETER_NAME = "clazz";

    private static final String NESTED_ENDPOINT_EXCEPTION_SUFFIX = "Exception";

    private static final String EXCEPTION_RETRIEVER_CLASSNAME = "ExceptionRetriever";
    private static final String GET_EXCEPTION_METHOD_NAME = "getException";

    private static final String IMMUTABLES_ERROR_ATTRIBUTE_NAME = "error";

    private final HttpService httpService;
    private final ClassName errorDecoderClassName;
    private final ClassName exceptionRetrieverClassName;
    private final Map<NamedType, ClassName> errorClassNames = new HashMap<>();
    private final Map<HttpEndpoint, ClassName> baseExceptionClassNames = new HashMap<>();
    private final Multimap<NamedType, HttpEndpoint> errorToEndpoints = ArrayListMultimap.create();

    public ServiceErrorDecoderGenerator(GeneratorContext generatorContext, HttpService httpService) {
        super(generatorContext, PackageType.SERVICES);
        this.httpService = httpService;
        this.errorDecoderClassName = generatorContext
                .getClassNameUtils()
                .getClassName(
                        httpService.name().name() + ERROR_DECODER_CLASSNAME_SUFFIX,
                        Optional.of(PackageType.SERVICES),
                        Optional.of(httpService.name().fernFilepath()));
        this.exceptionRetrieverClassName = errorDecoderClassName.nestedClass(EXCEPTION_RETRIEVER_CLASSNAME);
        httpService.endpoints().forEach(httpEndpoint -> {
            httpEndpoint.errors().possibleErrors().forEach(responseError -> {
                errorToEndpoints.put(responseError.error(), httpEndpoint);
            });
        });
        httpService.endpoints().forEach(httpEndpoint -> {
            if (!httpEndpoint.errors().possibleErrors().isEmpty()) {
                ClassName endpointBaseException = generatorContext
                        .getClassNameUtils()
                        .getNestedClassName(
                                errorDecoderClassName, httpEndpoint.endpointId() + NESTED_ENDPOINT_EXCEPTION_SUFFIX);
                baseExceptionClassNames.put(httpEndpoint, endpointBaseException);
            }
        });
        errorToEndpoints.keys().forEach(namedType -> {
            ClassName nestedResponseError = errorDecoderClassName.nestedClass(namedType.name());
            errorClassNames.put(namedType, nestedResponseError);
        });
    }

    public GeneratedErrorDecoder generate() {
        Map<HttpEndpoint, ClassName> endpointToBaseException = httpService.endpoints().stream()
                .filter(httpEndpoint -> !httpEndpoint.errors().possibleErrors().isEmpty())
                .collect(Collectors.toMap(Function.identity(), baseExceptionClassNames::get));
        List<TypeSpec> baseExceptionTypeSpecs = httpService.endpoints().stream()
                .filter(httpEndpoint -> !httpEndpoint.errors().possibleErrors().isEmpty())
                .map(this::getBaseEndpointExceptionInterface)
                .collect(Collectors.toList());
        Map<NamedType, TypeSpec> nestedErrorTypeSpecs = KeyedStream.stream(errorToEndpoints.asMap())
                .map((namedType, httpEndpoints) -> {
                    List<ClassName> endpointBaseExceptionClassNames = httpEndpoints.stream()
                            .map(baseExceptionClassNames::get)
                            .collect(Collectors.toList());
                    return getNestedErrorTypeSpec(namedType, endpointBaseExceptionClassNames);
                })
                .collectToMap();
        TypeSpec errorDecoderTypeSpec = TypeSpec.classBuilder(errorDecoderClassName.simpleName())
                .addModifiers(Modifier.FINAL)
                .addSuperinterface(ErrorDecoder.class)
                .addMethod(getDecodeMethodSpec(endpointToBaseException))
                .addMethod(getDecodeExceptionMethodSpec())
                .addType(getExceptionRetrieverInterface())
                .addTypes(baseExceptionTypeSpecs)
                .addTypes(nestedErrorTypeSpecs.values())
                .build();
        JavaFile errorDecoderServiceFile = JavaFile.builder(errorDecoderClassName.packageName(), errorDecoderTypeSpec)
                .build();
        return GeneratedErrorDecoder.builder()
                .file(errorDecoderServiceFile)
                .className(errorDecoderClassName)
                .build();
    }

    private MethodSpec getDecodeMethodSpec(Map<HttpEndpoint, ClassName> endpointToBaseException) {
        MethodSpec.Builder decodeMethodSpecBuilder = MethodSpec.methodBuilder(DECODE_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Override.class)
                .returns(Exception.class)
                .addParameter(ClassNameUtils.STRING_CLASS_NAME, DECODE_METHOD_KEY_PARAMETER_NAME)
                .addParameter(FEIGN_RESPONSE_PARAMETER_TYPE, DECODE_METHOD_RESPONSE_PARAMETER_NAME);
        CodeBlock.Builder codeBlockBuilder = CodeBlock.builder();
        boolean ifStatementStarted = false;
        for (HttpEndpoint httpEndpoint : httpService.endpoints()) {
            if (httpEndpoint.errors().possibleErrors().isEmpty()) {
                continue;
            }
            codeBlockBuilder
                    .beginControlFlow(
                            "$L ($L.contains($S))",
                            ifStatementStarted ? "else if" : "if",
                            DECODE_METHOD_KEY_PARAMETER_NAME,
                            httpEndpoint.endpointId())
                    .addStatement(
                            "return $L($L, $T.class).$L()",
                            DECODE_EXCEPTION_METHOD_NAME,
                            DECODE_METHOD_RESPONSE_PARAMETER_NAME,
                            endpointToBaseException.get(httpEndpoint),
                            GET_EXCEPTION_METHOD_NAME)
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
        TypeVariableName decodeMethodGeneric = TypeVariableName.get("T").withBounds(exceptionRetrieverClassName);
        return MethodSpec.methodBuilder(DECODE_METHOD_NAME)
                .addModifiers(Modifier.PRIVATE, Modifier.STATIC)
                .addAnnotation(Override.class)
                .addTypeVariable(decodeMethodGeneric)
                .returns(exceptionRetrieverClassName)
                .addParameter(FEIGN_RESPONSE_PARAMETER_TYPE, DECODE_EXCEPTION_RESPONSE_PARAMETER_NAME)
                .addParameter(
                        ParameterizedTypeName.get(ClassName.get(Class.class), decodeMethodGeneric),
                        DECODE_EXCEPTION_CLAZZ_PARAMETER_NAME)
                .beginControlFlow("try")
                .addStatement(
                        "return $T.$L.readValue($L.body().asInputStream(), $L)",
                        generatorContext.getClientObjectMappersFile().className(),
                        ClientObjectMapperGenerator.JSON_MAPPER_FIELD_NAME,
                        DECODE_EXCEPTION_RESPONSE_PARAMETER_NAME,
                        DECODE_EXCEPTION_CLAZZ_PARAMETER_NAME)
                .endControlFlow()
                .beginControlFlow("catch ($T e)", ClassName.get(IOException.class))
                .addStatement(
                        "return () -> new $T($S)",
                        generatorContext.getUnknownRemoteExceptionFile().className(),
                        "Failed to read error body")
                .endControlFlow()
                .build();
    }

    private TypeSpec getExceptionRetrieverInterface() {
        return TypeSpec.interfaceBuilder(EXCEPTION_RETRIEVER_CLASSNAME)
                .addMethod(MethodSpec.methodBuilder(GET_EXCEPTION_METHOD_NAME)
                        .addModifiers(Modifier.ABSTRACT, Modifier.PUBLIC)
                        .returns(Exception.class)
                        .build())
                .build();
    }

    private TypeSpec getBaseEndpointExceptionInterface(HttpEndpoint httpEndpoint) {
        ClassName endpointBaseException = baseExceptionClassNames.get(httpEndpoint);
        TypeSpec.Builder endpointBaseExceptionBuilder = TypeSpec.interfaceBuilder(endpointBaseException.simpleName())
                .addSuperinterface(exceptionRetrieverClassName)
                .addAnnotation(AnnotationSpec.builder(JsonTypeInfo.class)
                        .addMember("use", "$T.$L", ClassName.get(JsonTypeInfo.Id.class), JsonTypeInfo.Id.NAME.name())
                        .addMember(
                                "include",
                                "$T.$L",
                                ClassName.get(JsonTypeInfo.As.class),
                                JsonTypeInfo.As.EXISTING_PROPERTY.name())
                        .addMember("property", "$S", httpEndpoint.errors().discriminant())
                        .addMember("visible", "true")
                        .addMember(
                                "defaultImpl",
                                "$T.class",
                                generatorContext.getUnknownRemoteExceptionFile().className())
                        .build());
        AnnotationSpec.Builder jsonSubTypeAnnotationBuilder = AnnotationSpec.builder(JsonSubTypes.class);
        httpEndpoint.errors().possibleErrors().forEach(responseError -> {
            AnnotationSpec subTypeAnnotation = AnnotationSpec.builder(JsonSubTypes.Type.class)
                    .addMember("value", "$T.class", errorClassNames.get(responseError.error()))
                    .addMember("name", "$S", responseError.discriminantValue())
                    .build();
            jsonSubTypeAnnotationBuilder.addMember("value", "$L", subTypeAnnotation);
        });
        endpointBaseExceptionBuilder.addAnnotation(jsonSubTypeAnnotationBuilder.build());
        return endpointBaseExceptionBuilder.build();
    }

    private TypeSpec getNestedErrorTypeSpec(NamedType errorNamedType, List<ClassName> endpointBaseExceptions) {
        ClassName nestedErrorClassName = errorClassNames.get(errorNamedType);
        ClassName immutablesClassName =
                generatorContext.getImmutablesUtils().getImmutablesClassName(nestedErrorClassName);
        return TypeSpec.interfaceBuilder(nestedErrorClassName)
                .addAnnotation(Value.Immutable.class)
                .addAnnotation(AnnotationSpec.builder(JsonDeserialize.class)
                        .addMember("as", "$T.class", immutablesClassName)
                        .build())
                .addSuperinterfaces(endpointBaseExceptions)
                .addMethod(MethodSpec.methodBuilder(IMMUTABLES_ERROR_ATTRIBUTE_NAME)
                        .addModifiers(Modifier.ABSTRACT, Modifier.PUBLIC)
                        .addAnnotation(JsonValue.class)
                        .returns(errorClassNames.get(errorNamedType))
                        .build())
                .addMethod(MethodSpec.methodBuilder(GET_EXCEPTION_METHOD_NAME)
                        .addModifiers(Modifier.DEFAULT, Modifier.PUBLIC)
                        .addAnnotation(Override.class)
                        .addStatement("return error()")
                        .returns(Exception.class)
                        .build())
                .build();
    }
}
