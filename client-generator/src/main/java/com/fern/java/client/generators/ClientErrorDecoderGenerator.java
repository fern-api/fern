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

import com.fern.ir.model.services.http.HttpEndpoint;
import com.fern.ir.model.services.http.HttpEndpointId;
import com.fern.ir.model.services.http.HttpService;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.generators.ObjectMappersGenerator;
import com.fern.java.output.AbstractGeneratedJavaFile;
import com.fern.java.output.GeneratedJavaFile;
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

public final class ClientErrorDecoderGenerator extends AbstractFileGenerator {
    private static final String DECODE_METHOD_NAME = "decode";
    private static final String DECODE_METHOD_KEY_PARAMETER_NAME = "methodKey";
    private static final String DECODE_METHOD_RESPONSE_PARAMETER_NAME = "response";
    private static final String DECODE_EXCEPTION_METHOD_NAME = "decodeException";
    private static final String DECODE_EXCEPTION_RESPONSE_PARAMETER_NAME = "response";
    private static final String DECODE_EXCEPTION_CLAZZ_PARAMETER_NAME = "clazz";

    private final HttpService httpService;
    private final Map<HttpEndpointId, AbstractGeneratedJavaFile> generatedEndpointExceptions;
    private final GeneratedJavaFile objectMapper;

    public ClientErrorDecoderGenerator(
            ClientGeneratorContext generatorContext,
            HttpService httpService,
            Map<HttpEndpointId, AbstractGeneratedJavaFile> generatedEndpointExceptions,
            GeneratedJavaFile objectMapper) {
        super(
                generatorContext.getPoetClassNameFactory().getServiceErrorDecoderClassname(httpService),
                generatorContext);
        this.httpService = httpService;
        this.generatedEndpointExceptions = generatedEndpointExceptions;
        this.objectMapper = objectMapper;
    }

    @Override
    public AbstractGeneratedJavaFile generateFile() {
        TypeSpec errorDecoderTypeSpec = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.FINAL)
                .addSuperinterface(ErrorDecoder.class)
                .addMethod(getDecodeMethodSpec())
                .addMethod(getDecodeExceptionMethodSpec())
                .build();
        JavaFile errorDecoderFile =
                JavaFile.builder(className.packageName(), errorDecoderTypeSpec).build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(errorDecoderFile)
                .build();
    }

    private MethodSpec getDecodeMethodSpec() {
        MethodSpec.Builder decodeMethodSpecBuilder = MethodSpec.methodBuilder(DECODE_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Override.class)
                .returns(Exception.class)
                .addParameter(String.class, DECODE_METHOD_KEY_PARAMETER_NAME)
                .addParameter(Response.class, DECODE_METHOD_RESPONSE_PARAMETER_NAME);
        CodeBlock.Builder codeBlockBuilder = CodeBlock.builder().beginControlFlow("try");
        boolean ifStatementStarted = false;
        for (HttpEndpoint httpEndpoint : httpService.getEndpoints()) {
            AbstractGeneratedJavaFile endpointException = generatedEndpointExceptions.get(httpEndpoint.getId());
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
                            endpointException.getClassName())
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
                .returns(Exception.class)
                .addParameter(Response.class, DECODE_EXCEPTION_RESPONSE_PARAMETER_NAME)
                .addParameter(
                        ParameterizedTypeName.get(ClassName.get(Class.class), genericReturnType),
                        DECODE_EXCEPTION_CLAZZ_PARAMETER_NAME)
                .addException(IOException.class)
                .addStatement(
                        "return $T.$L.reader().withAttribute($S, $L.status())"
                                + ".readValue($L.body().asInputStream(), $L)",
                        objectMapper.getClassName(),
                        ObjectMappersGenerator.JSON_MAPPER_STATIC_FIELD_NAME,
                        "statusCode",
                        DECODE_EXCEPTION_RESPONSE_PARAMETER_NAME,
                        DECODE_EXCEPTION_RESPONSE_PARAMETER_NAME,
                        DECODE_EXCEPTION_CLAZZ_PARAMETER_NAME)
                .build();
    }
}
