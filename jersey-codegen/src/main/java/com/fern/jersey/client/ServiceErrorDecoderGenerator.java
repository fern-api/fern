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

import com.fern.codegen.GeneratedErrorDecoder;
import com.fern.codegen.Generator;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.IGeneratedFile;
import com.fern.codegen.utils.ClassNameConstants;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.ir.model.services.http.HttpEndpoint;
import com.fern.ir.model.services.http.HttpEndpointId;
import com.fern.ir.model.services.http.HttpService;
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

    private final HttpService httpService;
    private final ClassName errorDecoderClassName;
    private final Map<HttpEndpointId, IGeneratedFile> generatedEndpointExceptions;

    public ServiceErrorDecoderGenerator(
            GeneratorContext generatorContext,
            HttpService httpService,
            Map<HttpEndpointId, IGeneratedFile> generatedEndpointExceptions) {
        super(generatorContext);
        this.httpService = httpService;
        this.errorDecoderClassName = generatorContext
                .getClassNameUtils()
                .getClassNameFromServiceName(httpService.getName(), ERROR_DECODER_CLASSNAME_SUFFIX, PackageType.CLIENT);
        this.generatedEndpointExceptions = generatedEndpointExceptions;
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
                .addParameter(ClassNameConstants.STRING_CLASS_NAME, DECODE_METHOD_KEY_PARAMETER_NAME)
                .addParameter(FEIGN_RESPONSE_PARAMETER_TYPE, DECODE_METHOD_RESPONSE_PARAMETER_NAME);
        CodeBlock.Builder codeBlockBuilder = CodeBlock.builder().beginControlFlow("try");
        boolean ifStatementStarted = false;
        for (HttpEndpoint httpEndpoint : httpService.getEndpoints()) {
            IGeneratedFile endpointException = generatedEndpointExceptions.get(httpEndpoint.getId());
            codeBlockBuilder
                    .beginControlFlow(
                            "$L ($L.contains($S))",
                            ifStatementStarted ? "else if" : "if",
                            DECODE_METHOD_KEY_PARAMETER_NAME,
                            httpEndpoint.getId())
                    .addStatement(
                            "return $L($L, $T.class)",
                            DECODE_EXCEPTION_METHOD_NAME,
                            DECODE_METHOD_RESPONSE_PARAMETER_NAME,
                            endpointException.className())
                    .endControlFlow();
        }
        codeBlockBuilder
                .endControlFlow()
                .beginControlFlow("catch ($T e)", IOException.class)
                .endControlFlow();
        codeBlockBuilder.addStatement(
                "return new $T($L)",
                RuntimeException.class,
                "\"Failed to read response body. Received status \" "
                        + "+ response.status() + \" for method \" + methodKey");
        return decodeMethodSpecBuilder.addCode(codeBlockBuilder.build()).build();
    }

    private MethodSpec getDecodeExceptionMethodSpec() {
        TypeVariableName genericReturnType = TypeVariableName.get("T", Exception.class);
        return MethodSpec.methodBuilder(DECODE_EXCEPTION_METHOD_NAME)
                .addModifiers(Modifier.PRIVATE, Modifier.STATIC)
                .addTypeVariable(genericReturnType)
                .returns(ClassNameConstants.EXCEPTION_CLASS_NAME)
                .addParameter(FEIGN_RESPONSE_PARAMETER_TYPE, DECODE_EXCEPTION_RESPONSE_PARAMETER_NAME)
                .addParameter(
                        ParameterizedTypeName.get(ClassName.get(Class.class), genericReturnType),
                        DECODE_EXCEPTION_CLAZZ_PARAMETER_NAME)
                .addException(IOException.class)
                .addStatement(
                        "return $T.$L.reader().withAttribute($S, $L.status())"
                                + ".readValue($L.body().asInputStream(), $L)",
                        ClassNameConstants.CLIENT_OBJECT_MAPPERS_CLASS_NAME,
                        ClassNameConstants.CLIENT_OBJECT_MAPPERS_JSON_MAPPER_FIELD_NAME,
                        "statusCode",
                        DECODE_EXCEPTION_RESPONSE_PARAMETER_NAME,
                        DECODE_EXCEPTION_RESPONSE_PARAMETER_NAME,
                        DECODE_EXCEPTION_CLAZZ_PARAMETER_NAME)
                .build();
    }
}
