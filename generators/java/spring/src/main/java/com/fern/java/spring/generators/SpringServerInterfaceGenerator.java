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
package com.fern.java.spring.generators;

import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.http.*;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.AbstractGeneratedJavaFile;
import com.fern.java.output.GeneratedAuthFiles;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.spring.GeneratedSpringException;
import com.fern.java.spring.GeneratedSpringServerInterface;
import com.fern.java.spring.SpringGeneratorContext;
import com.fern.java.spring.generators.spring.AuthToSpringParameterSpecConverter;
import com.fern.java.spring.generators.spring.SpringHttpMethodToAnnotationSpec;
import com.fern.java.spring.generators.spring.SpringParameterSpecFactory;
import com.fern.java.utils.HttpPathUtils;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.security.Principal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.lang.model.element.Modifier;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

public final class SpringServerInterfaceGenerator extends AbstractFileGenerator {

    private final HttpService httpService;
    private final Optional<GeneratedAuthFiles> maybeAuth;
    private final SpringParameterSpecFactory springParameterSpecFactory;
    private final Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces;
    private final Map<ErrorId, GeneratedSpringException> exceptions;
    private final List<AbstractGeneratedJavaFile> generatedRequestBodyFiles = new ArrayList<>();
    private final SpringGeneratorContext springGeneratorContext;

    public SpringServerInterfaceGenerator(
            SpringGeneratorContext springGeneratorContext,
            Optional<GeneratedAuthFiles> maybeAuth,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces,
            Map<ErrorId, GeneratedSpringException> exceptions,
            HttpService httpService) {
        super(
                springGeneratorContext.getPoetClassNameFactory().getServiceInterfaceClassName(httpService),
                springGeneratorContext);
        this.springGeneratorContext = springGeneratorContext;
        this.httpService = httpService;
        this.maybeAuth = maybeAuth;
        this.springParameterSpecFactory = new SpringParameterSpecFactory(springGeneratorContext);
        this.allGeneratedInterfaces = allGeneratedInterfaces;
        this.exceptions = exceptions;
    }

    @Override
    public GeneratedSpringServerInterface generateFile() {
        String basePath = HttpPathUtils.getPathWithCurlyBracedPathParams(httpService.getBasePath());
        TypeSpec.Builder jerseyServiceBuilder = TypeSpec.interfaceBuilder(className)
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(AnnotationSpec.builder(RequestMapping.class)
                        .addMember("path", "$S", basePath.isEmpty() ? "/" : basePath)
                        .build());
        Map<EndpointName, MethodSpec> endpointToMethodSpec = new LinkedHashMap<>();
        httpService.getEndpoints().forEach(httpEndpoint -> {
            endpointToMethodSpec.put(httpEndpoint.getName(), getEndpointMethodSpec(httpEndpoint));
        });
        TypeSpec springServiceTypeSpec =
                jerseyServiceBuilder.addMethods(endpointToMethodSpec.values()).build();
        JavaFile springServiceJavaFile =
                JavaFile.builder(className.packageName(), springServiceTypeSpec).build();
        return GeneratedSpringServerInterface.builder()
                .className(className)
                .javaFile(springServiceJavaFile)
                .addAllGeneratedRequestBodyFiles(generatedRequestBodyFiles)
                .build();
    }

    private MethodSpec getEndpointMethodSpec(HttpEndpoint httpEndpoint) {
        List<ParameterSpec> endpointParameters = getEndpointMethodParameters(httpEndpoint);
        MethodSpec.Builder endpointMethodBuilder = MethodSpec.methodBuilder(
                        httpEndpoint.getName().get().getCamelCase().getSafeName())
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .addAnnotation(httpEndpoint.getMethod().visit(new SpringHttpMethodToAnnotationSpec(httpEndpoint)))
                .addParameters(endpointParameters);

        Optional<HttpResponse> httpResponse = httpEndpoint.getResponse();
        if (httpResponse.isPresent() && httpResponse.get().getBody().isPresent()) {
            httpResponse.get().getBody().get().visit(new HttpResponseBody.Visitor<Void>() {
                @Override
                public Void visitJson(JsonResponse json) {
                    JsonResponseBody body = json.visit(new JsonResponse.Visitor<JsonResponseBody>() {
                        @Override
                        public JsonResponseBody visitResponse(JsonResponseBody response) {
                            return response;
                        }

                        @Override
                        public JsonResponseBody visitNestedPropertyAsResponse(
                                JsonResponseBodyWithProperty nestedPropertyAsResponse) {
                            throw new RuntimeException("Returning nested properties as response is unsupported");
                        }

                        @Override
                        public JsonResponseBody _visitUnknown(Object unknownType) {
                            throw new RuntimeException("Encountered unknown json response body type: " + unknownType);
                        }
                    });
                    TypeName responseTypeName = generatorContext
                            .getPoetTypeNameMapper()
                            .convertToTypeName(true, body.getResponseBodyType());
                    endpointMethodBuilder.returns(responseTypeName);
                    return null;
                }

                @Override
                public Void visitFileDownload(FileDownloadResponse fileDownload) {
                    throw new RuntimeException("File download is not supported in spring server generator");
                }

                @Override
                public Void visitText(TextResponse text) {
                    throw new RuntimeException("Text plain responses are not supported in spring server generator");
                }

                @Override
                public Void visitBytes(BytesResponse bytesResponse) {
                    throw new RuntimeException("Bytes responses are not supported in spring server generator");
                }

                @Override
                public Void visitStreaming(StreamingResponse streaming) {
                    throw new RuntimeException("Streaming responses are not supported in spring server generator");
                }

                @Override
                public Void visitStreamParameter(StreamParameterResponse streamParameterResponse) {
                    throw new RuntimeException(
                            "Stream parameter responses are not supported in spring server generator");
                }

                @Override
                public Void _visitUnknown(Object unknownType) {
                    return null;
                }
            });
        }

        httpEndpoint.getErrors().get().stream()
                .map(responseError -> responseError.getError().getErrorId())
                .map(exceptions::get)
                .forEach(springException -> {
                    endpointMethodBuilder.addException(springException.getClassName());
                });

        return endpointMethodBuilder.build();
    }

    private List<ParameterSpec> getEndpointMethodParameters(HttpEndpoint httpEndpoint) {
        List<ParameterSpec> parameters = new ArrayList<>();

        // auth
        maybeAuth.ifPresent(auth -> {
            AuthToSpringParameterSpecConverter authToJerseyParameterSpecConverter =
                    new AuthToSpringParameterSpecConverter(generatorContext, auth);
            parameters.addAll(authToJerseyParameterSpecConverter.getAuthParameters(httpEndpoint));
        });

        if (httpEndpoint.getAuth()) {
            boolean isPrincipalPresent = httpService.getHeaders().stream().anyMatch(httpHeader -> httpHeader
                            .getName()
                            .getName()
                            .getCamelCase()
                            .getSafeName()
                            .equalsIgnoreCase("principal"))
                    || httpService.getPathParameters().stream().anyMatch(pathParameter -> pathParameter
                            .getName()
                            .getCamelCase()
                            .getSafeName()
                            .equalsIgnoreCase("principal"))
                    || httpService.getPathParameters().stream().anyMatch(queryParameter -> queryParameter
                            .getName()
                            .getCamelCase()
                            .getSafeName()
                            .equalsIgnoreCase("principal"));
            parameters.add(ParameterSpec.builder(
                            ClassName.get(Principal.class), isPrincipalPresent ? "_principal" : "principal")
                    .build());
        }

        // headers
        generatorContext.getGlobalHeaders().getRequiredGlobalHeaders().forEach(httpHeader -> {
            parameters.add(springParameterSpecFactory.getHeaderParameterSpec(httpHeader));
        });
        generatorContext.getGlobalHeaders().getOptionalGlobalHeaders().forEach(httpHeader -> {
            parameters.add(springParameterSpecFactory.getHeaderParameterSpec(httpHeader));
        });
        httpService.getHeaders().forEach(httpHeader -> {
            parameters.add(springParameterSpecFactory.getHeaderParameterSpec(httpHeader));
        });
        httpEndpoint.getHeaders().forEach(httpHeader -> {
            parameters.add(springParameterSpecFactory.getHeaderParameterSpec(httpHeader));
        });

        // path params
        httpService.getPathParameters().forEach(pathParameter -> {
            parameters.add(springParameterSpecFactory.getPathParameterSpec(pathParameter));
        });
        httpEndpoint.getPathParameters().forEach(pathParameter -> {
            parameters.add(springParameterSpecFactory.getPathParameterSpec(pathParameter));
        });

        // query params
        httpEndpoint.getQueryParameters().forEach(queryParameter -> {
            parameters.add(springParameterSpecFactory.getQueryParameterSpec(queryParameter));
        });

        // request body
        if (httpEndpoint.getRequestBody().isPresent()) {
            HttpRequestBody httpRequestBody = httpEndpoint.getRequestBody().get();
            TypeName requestBodyTypeName = httpRequestBody.visit(new HttpRequestBody.Visitor<TypeName>() {
                @Override
                public TypeName visitInlinedRequestBody(InlinedRequestBody inlinedRequestBody) {
                    InlinedRequestBodyGenerator inlinedRequestBodyGenerator = new InlinedRequestBodyGenerator(
                            httpService, inlinedRequestBody, allGeneratedInterfaces, springGeneratorContext);
                    AbstractGeneratedJavaFile generatedFile = inlinedRequestBodyGenerator.generateFile();
                    generatedRequestBodyFiles.add(generatedFile);
                    return generatedFile.getClassName();
                }

                @Override
                public TypeName visitReference(HttpRequestBodyReference reference) {
                    return generatorContext
                            .getPoetTypeNameMapper()
                            .convertToTypeName(true, reference.getRequestBodyType());
                }

                @Override
                public TypeName visitFileUpload(FileUploadRequest fileUpload) {
                    throw new UnsupportedOperationException("File upload not supported");
                }

                @Override
                public TypeName visitBytes(BytesRequest bytes) {
                    throw new UnsupportedOperationException("Bytes request is not supported");
                }

                @Override
                public TypeName _visitUnknown(Object unknownType) {
                    throw new RuntimeException("Encountered unknown request body type: " + unknownType);
                }
            });
            parameters.add(ParameterSpec.builder(requestBodyTypeName, "body")
                    .addAnnotation(RequestBody.class)
                    .build());
        }

        return parameters;
    }
}
