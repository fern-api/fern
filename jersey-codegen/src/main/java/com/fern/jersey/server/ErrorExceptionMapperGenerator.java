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

package com.fern.jersey.server;

import com.fern.codegen.GeneratedEndpointError;
import com.fern.codegen.GeneratedEndpointModel;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratedFile;
import com.fern.codegen.GeneratedHttpServiceServer;
import com.fern.codegen.Generator;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameConstants;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.ir.model.services.http.HttpEndpoint;
import com.fern.ir.model.services.http.HttpEndpointId;
import com.fern.ir.model.services.http.HttpService;
import com.fern.model.codegen.errors.ErrorGenerator;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.lang.model.element.Modifier;
import javax.ws.rs.container.ResourceInfo;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;

public final class ErrorExceptionMapperGenerator extends Generator {

    private static final String EXCEPTION_MAPPER_CLASSNAME_SUFFIX = "ExceptionMapper";
    private static final String EXCEPTION_PARAMETER_NAME = "e";
    private static final String RESOURCE_INFO_FIELD_NAME = "resourceInfo";
    private static final String TO_RESPONSE_METHOD_NAME;

    static {
        try {
            TO_RESPONSE_METHOD_NAME = ExceptionMapper.class
                    .getMethod("toResponse", Throwable.class)
                    .getName();
        } catch (NoSuchMethodException e) {
            throw new RuntimeException("Failed to find ExceptionMapper.toResponse method name", e);
        }
    }

    private final Map<HttpService, List<HttpEndpoint>> endpointsThrowingError;
    private final Map<HttpService, Map<HttpEndpointId, GeneratedEndpointModel>> generatedEndpointModels;
    private final Map<HttpService, GeneratedHttpServiceServer> generatedHttpServers;
    private final GeneratedError generatedError;
    private final ClassName generatedExceptionMapperClassname;

    public ErrorExceptionMapperGenerator(
            GeneratorContext generatorContext,
            GeneratedError generatedError,
            Map<HttpService, List<HttpEndpoint>> endpointsThrowingError,
            Map<HttpService, GeneratedHttpServiceServer> generatedHttpServers,
            Map<HttpService, Map<HttpEndpointId, GeneratedEndpointModel>> generatedEndpointModels) {
        super(generatorContext);
        this.generatedError = generatedError;
        this.generatedHttpServers = generatedHttpServers;
        this.generatedEndpointModels = generatedEndpointModels;
        this.endpointsThrowingError = endpointsThrowingError;
        this.generatedExceptionMapperClassname = generatorContext
                .getClassNameUtils()
                .getClassName(
                        generatedError.className().simpleName(),
                        Optional.of(EXCEPTION_MAPPER_CLASSNAME_SUFFIX),
                        Optional.of(generatedError.errorDeclaration().getName().getFernFilepath()),
                        PackageType.SERVER);
    }

    @Override
    public GeneratedFile generate() {
        TypeSpec exceptionMapperTypeSpec = TypeSpec.classBuilder(generatedExceptionMapperClassname)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addSuperinterface(
                        ParameterizedTypeName.get(ClassName.get(ExceptionMapper.class), generatedError.className()))
                .addField(FieldSpec.builder(
                                ClassNameConstants.LOGGER_CLASS_NAME,
                                ClassNameConstants.LOGGER_FIELD_NAME,
                                Modifier.PRIVATE,
                                Modifier.STATIC,
                                Modifier.FINAL)
                        .initializer(
                                "$T.$L($T.class)",
                                ClassNameConstants.LOGGER_FACTORY_CLASS_NAME,
                                ClassNameConstants.GET_LOGGER_METHOD_NAME,
                                generatedExceptionMapperClassname)
                        .build())
                .addField(FieldSpec.builder(ClassName.get(ResourceInfo.class), RESOURCE_INFO_FIELD_NAME)
                        .addAnnotation(Context.class)
                        .build())
                .addMethod(generateToResponseMethod())
                .build();
        JavaFile exceptionMapperJavaFile = JavaFile.builder(
                        generatedExceptionMapperClassname.packageName(), exceptionMapperTypeSpec)
                .build();
        return GeneratedFile.builder()
                .file(exceptionMapperJavaFile)
                .className(generatedExceptionMapperClassname)
                .build();
    }

    private MethodSpec generateToResponseMethod() {
        MethodSpec.Builder toResponseMethodBuilder = MethodSpec.methodBuilder(TO_RESPONSE_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Override.class)
                .addParameter(generatedError.className(), EXCEPTION_PARAMETER_NAME)
                .returns(Response.class);

        toResponseMethodBuilder.addStatement(
                "$L.info($S, $L.$L(), $L)",
                ClassNameConstants.LOGGER_FIELD_NAME,
                "Error handling request. ErrorInstanceId= {}",
                EXCEPTION_PARAMETER_NAME,
                ClassNameConstants.HTTP_EXCEPTION_ERROR_INSTANCE_ID_METHOD_NAME,
                EXCEPTION_PARAMETER_NAME);

        boolean firstServiceCondition = true;
        for (Map.Entry<HttpService, List<HttpEndpoint>> entry : endpointsThrowingError.entrySet()) {
            HttpService httpService = entry.getKey();
            GeneratedHttpServiceServer generatedHttpServiceServer = generatedHttpServers.get(httpService);
            toResponseMethodBuilder.beginControlFlow(
                    firstServiceCondition ? "if ($T.$L($L).contains($S))" : "else if ($T.$L($L).contains($S))",
                    ClassNameConstants.RESOURCE_INFO_UTILS_CLASSNAME,
                    ClassNameConstants.RESOURCE_INFO_GET_INTERFACE_NAMES_METHOD_NAME,
                    RESOURCE_INFO_FIELD_NAME,
                    generatedHttpServiceServer.className().simpleName());

            boolean firstEndpointCondition = true;
            for (HttpEndpoint httpEndpoint : entry.getValue()) {
                HttpEndpointId endpointId = httpEndpoint.getId();
                MethodSpec endpointMethodSpec =
                        generatedHttpServiceServer.methodsByEndpointId().get(endpointId);
                toResponseMethodBuilder.beginControlFlow(
                        firstEndpointCondition ? "if ($T.$L($L).contains($S))" : "else if ($T.$L($L).contains($S))",
                        ClassNameConstants.RESOURCE_INFO_UTILS_CLASSNAME,
                        ClassNameConstants.RESOURCE_INFO_GET_METHOD_NAME_METHOD_NAME,
                        RESOURCE_INFO_FIELD_NAME,
                        endpointMethodSpec.name);
                GeneratedEndpointModel generatedEndpointModel =
                        generatedEndpointModels.get(httpService).get(endpointId);
                GeneratedEndpointError generatedEndpointError = generatedEndpointModel
                        .errorFile()
                        .orElseThrow(() -> new IllegalStateException(
                                "Expected endpoint error to exist, but not found. EndpointId=" + endpointId));

                toResponseMethodBuilder.addStatement(
                        "return $T.status($L.$L()).entity($L.$L($L)).build()",
                        Response.class,
                        EXCEPTION_PARAMETER_NAME,
                        ErrorGenerator.GET_STATUS_CODE_METHOD_NAME,
                        generatedEndpointError.className(),
                        generatedEndpointError
                                .constructorsByResponseError()
                                .get(generatedError.errorDeclaration().getName())
                                .name,
                        EXCEPTION_PARAMETER_NAME);

                toResponseMethodBuilder.endControlFlow();
                firstEndpointCondition = false;
            }

            toResponseMethodBuilder.endControlFlow();
            firstServiceCondition = false;
        }

        toResponseMethodBuilder.addStatement("return null");
        return toResponseMethodBuilder.build();
    }
}
