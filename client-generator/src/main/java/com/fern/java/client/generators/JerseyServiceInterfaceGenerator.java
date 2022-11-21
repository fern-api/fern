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

import com.fern.ir.model.errors.DeclaredErrorName;
import com.fern.ir.model.services.http.HttpEndpoint;
import com.fern.ir.model.services.http.HttpEndpointId;
import com.fern.ir.model.services.http.HttpRequest;
import com.fern.ir.model.services.http.HttpResponse;
import com.fern.ir.model.services.http.HttpService;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedJerseyServiceInterface;
import com.fern.java.client.GeneratedJerseyServiceInterface.AuthEndpointParameter;
import com.fern.java.client.GeneratedJerseyServiceInterface.EndpointHeaderParameter;
import com.fern.java.client.GeneratedJerseyServiceInterface.EndpointParameter;
import com.fern.java.client.GeneratedJerseyServiceInterface.EndpointPathParameter;
import com.fern.java.client.GeneratedJerseyServiceInterface.EndpointQueryParameter;
import com.fern.java.client.GeneratedJerseyServiceInterface.EndpointRequestParameter;
import com.fern.java.client.GeneratedJerseyServiceInterface.GeneratedEndpointMethod;
import com.fern.java.client.generators.jersey.AuthToJerseyParameterSpecConverter;
import com.fern.java.client.generators.jersey.JerseyHttpMethodToAnnotationSpec;
import com.fern.java.client.generators.jersey.JerseyParameterSpecFactory;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.generators.ObjectMappersGenerator;
import com.fern.java.jersey.contracts.OptionalAwareContract;
import com.fern.java.output.AbstractGeneratedJavaFile;
import com.fern.java.output.GeneratedAuthFiles;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.utils.HttpPathUtils;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import feign.Feign;
import feign.jackson.JacksonDecoder;
import feign.jackson.JacksonEncoder;
import feign.jaxrs.JAXRSContract;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import javax.ws.rs.Consumes;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

public final class JerseyServiceInterfaceGenerator extends AbstractFileGenerator {

    public static final String GET_CLIENT_METHOD_NAME = "getClient";

    private final HttpService httpService;
    private final Map<DeclaredErrorName, GeneratedJavaFile> generatedErrors;
    private final Optional<GeneratedAuthFiles> maybeAuth;
    private final ClientGeneratorContext clientGeneratorContext;
    private final JerseyParameterSpecFactory jerseyParameterSpecFactory;
    private final GeneratedJavaFile objectMapper;

    public JerseyServiceInterfaceGenerator(
            ClientGeneratorContext clientGeneratorContext,
            Map<DeclaredErrorName, GeneratedJavaFile> generatedErrors,
            Optional<GeneratedAuthFiles> maybeAuth,
            HttpService httpService,
            GeneratedJavaFile objectMapper) {
        super(
                clientGeneratorContext.getPoetClassNameFactory().getServiceInterfaceClassName(httpService),
                clientGeneratorContext);
        this.clientGeneratorContext = clientGeneratorContext;
        this.httpService = httpService;
        this.generatedErrors = generatedErrors;
        this.maybeAuth = maybeAuth;
        this.objectMapper = objectMapper;
        this.jerseyParameterSpecFactory = new JerseyParameterSpecFactory(clientGeneratorContext);
    }

    @Override
    public GeneratedJerseyServiceInterface generateFile() {
        TypeSpec.Builder jerseyInterfaceBuilder = TypeSpec.interfaceBuilder(className)
                .addAnnotation(AnnotationSpec.builder(Consumes.class)
                        .addMember("value", "$T.APPLICATION_JSON", MediaType.class)
                        .build())
                .addAnnotation(AnnotationSpec.builder(Produces.class)
                        .addMember("value", "$T.APPLICATION_JSON", MediaType.class)
                        .build())
                .addAnnotation(AnnotationSpec.builder(Path.class)
                        .addMember("value", "$S", httpService.getBasePath().orElse("/"))
                        .build());

        Map<HttpEndpointId, GeneratedEndpointMethod> endpointMethods = new HashMap<>();
        Map<HttpEndpointId, AbstractGeneratedJavaFile> endpointExceptions = new HashMap<>();
        for (HttpEndpoint httpEndpoint : httpService.getEndpoints()) {
            HttpEndpointId httpEndpointId = httpEndpoint.getId();
            ClientEndpointExceptionGenerator endpointExceptionGenerator = new ClientEndpointExceptionGenerator(
                    clientGeneratorContext, httpService, httpEndpoint, generatedErrors);
            AbstractGeneratedJavaFile endpointException = endpointExceptionGenerator.generateFile();

            GeneratedEndpointMethod generatedEndpointMethod = getEndpointMethodSpec(httpEndpoint, endpointException);
            jerseyInterfaceBuilder.addMethod(generatedEndpointMethod.methodSpec());

            endpointExceptions.put(httpEndpointId, endpointException);
            endpointMethods.put(httpEndpointId, generatedEndpointMethod);
        }

        AbstractGeneratedJavaFile errorDecoder = getErrorDecoder(endpointExceptions);
        TypeSpec jerseyInterfaceTypeSpec = jerseyInterfaceBuilder
                .addMethod(getStaticClientBuilderMethod(errorDecoder))
                .build();
        JavaFile jerseyServiceFile = JavaFile.builder(className.packageName(), jerseyInterfaceTypeSpec)
                .build();

        return GeneratedJerseyServiceInterface.builder()
                .className(className)
                .javaFile(jerseyServiceFile)
                .errorDecoder(errorDecoder)
                .putAllEndpointExceptions(endpointExceptions)
                .putAllEndpointMethods(endpointMethods)
                .build();
    }

    private GeneratedEndpointMethod getEndpointMethodSpec(
            HttpEndpoint httpEndpoint, AbstractGeneratedJavaFile endpointException) {
        List<EndpointParameter> endpointParameters = getEndpointMethodParameters(httpEndpoint);
        MethodSpec.Builder endpointMethodBuilder = MethodSpec.methodBuilder(
                        httpEndpoint.getName().getCamelCase())
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .addAnnotation(httpEndpoint.getMethod().visit(JerseyHttpMethodToAnnotationSpec.INSTANCE))
                .addAnnotation(AnnotationSpec.builder(Path.class)
                        .addMember(
                                "value", "$S", HttpPathUtils.getPathWithCurlyBracedPathParams(httpEndpoint.getPath()))
                        .build())
                .addParameters(endpointParameters.stream()
                        .map(EndpointParameter::parameterSpec)
                        .collect(Collectors.toList()))
                .addException(endpointException.getClassName());

        HttpResponse httpResponse = httpEndpoint.getResponse();
        if (!httpResponse.getType().isVoid()) {
            TypeName responseTypeName =
                    generatorContext.getPoetTypeNameMapper().convertToTypeName(true, httpResponse.getType());
            endpointMethodBuilder.returns(responseTypeName);
        }

        return GeneratedEndpointMethod.builder()
                .methodSpec(endpointMethodBuilder.build())
                .addAllParameters(endpointParameters)
                .build();
    }

    private List<EndpointParameter> getEndpointMethodParameters(HttpEndpoint httpEndpoint) {
        List<EndpointParameter> parameters = new ArrayList<>();

        // auth
        maybeAuth.ifPresent(auth -> {
            AuthToJerseyParameterSpecConverter authToJerseyParameterSpecConverter =
                    new AuthToJerseyParameterSpecConverter(generatorContext, auth);
            authToJerseyParameterSpecConverter.getAuthParameters(httpEndpoint).forEach(parameterSpec -> {
                parameters.add(AuthEndpointParameter.builder()
                        .parameterSpec(parameterSpec)
                        .build());
            });
        });

        // headers
        generatorContext.getGlobalHeaders().getRequiredGlobalHeaders().forEach(httpHeader -> {
            parameters.add(EndpointHeaderParameter.builder()
                    .parameterSpec(jerseyParameterSpecFactory.getHeaderParameterSpec(httpHeader))
                    .httpHeader(httpHeader)
                    .build());
        });
        generatorContext.getGlobalHeaders().getOptionalGlobalHeaders().forEach(httpHeader -> {
            parameters.add(EndpointHeaderParameter.builder()
                    .parameterSpec(jerseyParameterSpecFactory.getHeaderParameterSpec(httpHeader))
                    .httpHeader(httpHeader)
                    .build());
        });
        httpService.getHeaders().forEach(httpHeader -> {
            parameters.add(EndpointHeaderParameter.builder()
                    .parameterSpec(jerseyParameterSpecFactory.getHeaderParameterSpec(httpHeader))
                    .httpHeader(httpHeader)
                    .build());
        });
        httpEndpoint.getHeaders().forEach(httpHeader -> {
            parameters.add(EndpointHeaderParameter.builder()
                    .parameterSpec(jerseyParameterSpecFactory.getHeaderParameterSpec(httpHeader))
                    .httpHeader(httpHeader)
                    .build());
        });

        // path params
        httpEndpoint.getPathParameters().forEach(pathParameter -> {
            parameters.add(EndpointPathParameter.builder()
                    .parameterSpec(jerseyParameterSpecFactory.getPathParameterSpec(pathParameter))
                    .pathParameter(pathParameter)
                    .build());
        });

        // query params
        httpEndpoint.getQueryParameters().forEach(queryParameter -> {
            parameters.add(EndpointQueryParameter.builder()
                    .parameterSpec(jerseyParameterSpecFactory.getQueryParameterSpec(queryParameter))
                    .queryParameter(queryParameter)
                    .build());
        });

        // request body
        HttpRequest httpRequest = httpEndpoint.getRequest();
        if (!httpRequest.getType().isVoid()) {
            TypeName requestTypeName =
                    generatorContext.getPoetTypeNameMapper().convertToTypeName(true, httpRequest.getType());
            parameters.add(EndpointRequestParameter.builder()
                    .parameterSpec(
                            ParameterSpec.builder(requestTypeName, "body").build())
                    .httpRequest(httpRequest)
                    .build());
        }

        return parameters;
    }

    private AbstractGeneratedJavaFile getErrorDecoder(
            Map<HttpEndpointId, AbstractGeneratedJavaFile> endpointExceptions) {
        ClientErrorDecoderGenerator clientErrorDecoderGenerator =
                new ClientErrorDecoderGenerator(clientGeneratorContext, httpService, endpointExceptions, objectMapper);
        return clientErrorDecoderGenerator.generateFile();
    }

    private MethodSpec getStaticClientBuilderMethod(AbstractGeneratedJavaFile generatedErrorDecoder) {
        CodeBlock.Builder codeBlockBuilder = CodeBlock.builder()
                .add("return $T.builder()\n", Feign.class)
                .indent()
                .indent()
                .add(".contract(new $T(new $T()))\n", OptionalAwareContract.class, JAXRSContract.class)
                .add(
                        ".decoder(new $T($T.$L))\n",
                        JacksonDecoder.class,
                        objectMapper.getClassName(),
                        ObjectMappersGenerator.JSON_MAPPER_STATIC_FIELD_NAME)
                .add(
                        ".encoder(new $T($T.$L))\n",
                        JacksonEncoder.class,
                        objectMapper.getClassName(),
                        ObjectMappersGenerator.JSON_MAPPER_STATIC_FIELD_NAME)
                .add(".errorDecoder(new $T())", generatedErrorDecoder.getClassName());
        codeBlockBuilder.add(".target($T.class, $L);", className, "url");
        CodeBlock codeBlock = codeBlockBuilder.unindent().unindent().build();
        return MethodSpec.methodBuilder(GET_CLIENT_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addParameter(String.class, "url")
                .returns(className)
                .addCode(codeBlock)
                .build();
    }
}
