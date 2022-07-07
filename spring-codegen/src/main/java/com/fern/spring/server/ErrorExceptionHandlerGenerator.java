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

package com.fern.spring.server;

import com.fern.codegen.GeneratedEndpointError;
import com.fern.codegen.GeneratedEndpointModel;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratedFile;
import com.fern.codegen.GeneratedHttpServiceServer;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameConstants;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.spring.HandlerMethodUtils;
import com.fern.model.codegen.Generator;
import com.fern.model.codegen.errors.ErrorGenerator;
import com.fern.types.services.EndpointId;
import com.fern.types.services.HttpEndpoint;
import com.fern.types.services.HttpService;
import com.squareup.javapoet.AnnotationSpec;
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
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

public final class ErrorExceptionHandlerGenerator extends Generator {

    private static final String EXCEPTION_MAPPER_CLASSNAME_SUFFIX = "ExceptionMapper";
    private static final String EXCEPTION_PARAMETER_NAME = "e";

    private static final String HANDLE_METHOD_NAME = "handle";

    private static final String HANDLER_METHOD_PARAMETER_NAME = "handlerMethod";

    private final Map<HttpService, List<HttpEndpoint>> endpointsThrowingError;
    private final Map<HttpService, Map<EndpointId, GeneratedEndpointModel>> generatedEndpointModels;
    private final Map<HttpService, GeneratedHttpServiceServer> generatedHttpServers;
    private final GeneratedError generatedError;
    private final ClassName generatedExceptionMapperClassname;

    public ErrorExceptionHandlerGenerator(
            GeneratorContext generatorContext,
            GeneratedError generatedError,
            Map<HttpService, List<HttpEndpoint>> endpointsThrowingError,
            Map<HttpService, GeneratedHttpServiceServer> generatedHttpServers,
            Map<HttpService, Map<EndpointId, GeneratedEndpointModel>> generatedEndpointModels) {
        super(generatorContext, PackageType.ERRORS);
        this.generatedError = generatedError;
        this.generatedHttpServers = generatedHttpServers;
        this.generatedEndpointModels = generatedEndpointModels;
        this.endpointsThrowingError = endpointsThrowingError;
        this.generatedExceptionMapperClassname = generatorContext
                .getClassNameUtils()
                .getClassName(
                        generatedError.className().simpleName(),
                        Optional.of(EXCEPTION_MAPPER_CLASSNAME_SUFFIX),
                        Optional.of(packageType),
                        Optional.of(generatedError.errorDeclaration().name().fernFilepath()));
    }

    @Override
    public GeneratedFile generate() {
        TypeSpec exceptionMapperTypeSpec = TypeSpec.classBuilder(generatedExceptionMapperClassname)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .superclass(ClassName.get(ResponseEntityExceptionHandler.class))
                .addAnnotation(AnnotationSpec.builder(Order.class)
                        .addMember("value", "$T.HIGHEST_PRECEDENCE", Ordered.class)
                        .build())
                .addAnnotation(ControllerAdvice.class)
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
                .addMethod(generateHandleMethod())
                .build();
        JavaFile exceptionMapperJavaFile = JavaFile.builder(
                        generatedExceptionMapperClassname.packageName(), exceptionMapperTypeSpec)
                .build();
        return GeneratedFile.builder()
                .file(exceptionMapperJavaFile)
                .className(generatedExceptionMapperClassname)
                .build();
    }

    private MethodSpec generateHandleMethod() {
        MethodSpec.Builder toResponseMethodBuilder = MethodSpec.methodBuilder(HANDLE_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(AnnotationSpec.builder(ExceptionHandler.class)
                        .addMember("value", "$T.class", generatedError.className())
                        .build())
                .addParameter(generatedError.className(), EXCEPTION_PARAMETER_NAME)
                .addParameter(HandlerMethod.class, HANDLER_METHOD_PARAMETER_NAME)
                .returns(ParameterizedTypeName.get(ResponseEntity.class, Object.class));

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
                    HandlerMethodUtils.class,
                    ClassNameConstants.RESOURCE_INFO_GET_INTERFACE_NAMES_METHOD_NAME,
                    HANDLER_METHOD_PARAMETER_NAME,
                    generatedHttpServiceServer.className().simpleName());

            boolean firstEndpointCondition = true;
            for (HttpEndpoint httpEndpoint : entry.getValue()) {
                EndpointId endpointId = httpEndpoint.endpointId();
                MethodSpec endpointMethodSpec =
                        generatedHttpServiceServer.methodsByEndpointId().get(endpointId);
                toResponseMethodBuilder.beginControlFlow(
                        firstEndpointCondition ? "if ($T.$L($L).contains($S))" : "else if ($T.$L($L).contains($S))",
                        HandlerMethodUtils.class,
                        ClassNameConstants.RESOURCE_INFO_GET_METHOD_NAME_METHOD_NAME,
                        HANDLER_METHOD_PARAMETER_NAME,
                        endpointMethodSpec.name);
                GeneratedEndpointModel generatedEndpointModel =
                        generatedEndpointModels.get(httpService).get(endpointId);
                GeneratedEndpointError generatedEndpointError = generatedEndpointModel
                        .errorFile()
                        .orElseThrow(() -> new IllegalStateException(
                                "Expected endpoint error to exist, but not found. EndpointId=" + endpointId));

                toResponseMethodBuilder.addStatement(
                        "return new $T<>($T.$L($L), $T.valueOf($L.$L()))",
                        ResponseEntity.class,
                        generatedEndpointError.className(),
                        generatedEndpointError
                                .constructorsByResponseError()
                                .get(generatedError.errorDeclaration().name())
                                .name,
                        EXCEPTION_PARAMETER_NAME,
                        HttpStatus.class,
                        EXCEPTION_PARAMETER_NAME,
                        ErrorGenerator.GET_STATUS_CODE_METHOD_NAME);

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
