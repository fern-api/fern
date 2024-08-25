/*
 * (c) Copyright 2023 Birch Solutions Inc. All rights reserved.
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

package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.SdkRequestBodyType;
import com.fern.ir.model.http.SdkRequestShape;
import com.fern.ir.model.http.SdkRequestWrapper;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.client.GeneratedWrappedRequest;
import com.fern.java.client.GeneratedWrappedRequest.FileUploadRequestBodyGetters;
import com.fern.java.client.generators.WrappedRequestGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.FieldSpec;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public final class HttpEndpointMethodSpecFactory {

    private final HttpService httpService;
    private final HttpEndpoint httpEndpoint;
    private final GeneratedObjectMapper generatedObjectMapper;
    private final ClientGeneratorContext clientGeneratorContext;
    private final GeneratedClientOptions generatedClientOptions;
    private final FieldSpec clientOptionsField;
    private final GeneratedEnvironmentsClass generatedEnvironmentsClass;
    private final Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces;
    private final Map<ErrorId, GeneratedJavaFile> generatedErrors;

    private final List<GeneratedWrappedRequest> generatedWrappedRequests = new ArrayList<>();

    public HttpEndpointMethodSpecFactory(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            GeneratedObjectMapper generatedObjectMapper,
            ClientGeneratorContext clientGeneratorContext,
            GeneratedClientOptions generatedClientOptions,
            FieldSpec clientOptionsField,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces,
            Map<ErrorId, GeneratedJavaFile> generatedErrors) {
        this.httpService = httpService;
        this.httpEndpoint = httpEndpoint;
        this.generatedObjectMapper = generatedObjectMapper;
        this.clientGeneratorContext = clientGeneratorContext;
        this.generatedClientOptions = generatedClientOptions;
        this.clientOptionsField = clientOptionsField;
        this.allGeneratedInterfaces = allGeneratedInterfaces;
        this.generatedEnvironmentsClass = generatedEnvironmentsClass;
        this.generatedErrors = generatedErrors;
    }

    public HttpEndpointMethodSpecs create() {
        if (httpEndpoint.getSdkRequest().isPresent()) {
            return httpEndpoint.getSdkRequest().get().getShape().visit(new SdkRequestShape.Visitor<>() {
                @Override
                public HttpEndpointMethodSpecs visitJustRequestBody(SdkRequestBodyType sdkRequestBodyType) {
                    OnlyRequestEndpointWriter onlyRequestEndpointWriter = new OnlyRequestEndpointWriter(
                            httpService,
                            httpEndpoint,
                            generatedObjectMapper,
                            clientGeneratorContext,
                            clientOptionsField,
                            generatedClientOptions,
                            generatedEnvironmentsClass,
                            sdkRequestBodyType,
                            httpEndpoint.getSdkRequest().get(),
                            generatedErrors);
                    return onlyRequestEndpointWriter.generate();
                }

                @Override
                public HttpEndpointMethodSpecs visitWrapper(SdkRequestWrapper wrapper) {
                    WrappedRequestGenerator wrappedRequestGenerator = new WrappedRequestGenerator(
                            wrapper,
                            httpService,
                            httpEndpoint,
                            clientGeneratorContext
                                    .getPoetClassNameFactory()
                                    .getRequestWrapperBodyClassName(httpService, wrapper),
                            allGeneratedInterfaces,
                            clientGeneratorContext);
                    GeneratedWrappedRequest generatedWrappedRequest = wrappedRequestGenerator.generateFile();
                    generatedWrappedRequests.add(generatedWrappedRequest);
                    if (httpEndpoint.getHeaders().isEmpty()
                            && httpEndpoint.getQueryParameters().isEmpty()
                            && generatedWrappedRequest.requestBodyGetter().isPresent()
                            && !(generatedWrappedRequest.requestBodyGetter().get()
                                    instanceof FileUploadRequestBodyGetters)) {
                        OnlyRequestEndpointWriter onlyRequestEndpointWriter = new OnlyRequestEndpointWriter(
                                httpService,
                                httpEndpoint,
                                generatedObjectMapper,
                                clientGeneratorContext,
                                clientOptionsField,
                                generatedClientOptions,
                                generatedEnvironmentsClass,
                                generatedWrappedRequest,
                                httpEndpoint.getSdkRequest().get(),
                                generatedErrors);
                        return onlyRequestEndpointWriter.generate();
                    }
                    WrappedRequestEndpointWriter wrappedRequestEndpointWriter = new WrappedRequestEndpointWriter(
                            httpService,
                            httpEndpoint,
                            generatedObjectMapper,
                            clientOptionsField,
                            generatedClientOptions,
                            clientGeneratorContext,
                            httpEndpoint.getSdkRequest().get(),
                            generatedEnvironmentsClass,
                            generatedWrappedRequest,
                            generatedErrors);
                    return wrappedRequestEndpointWriter.generate();
                }

                @Override
                public HttpEndpointMethodSpecs _visitUnknown(Object unknownType) {
                    return null;
                }
            });
        } else {
            NoRequestEndpointWriter noRequestEndpointWriter = new NoRequestEndpointWriter(
                    httpService,
                    httpEndpoint,
                    generatedObjectMapper,
                    clientGeneratorContext,
                    clientOptionsField,
                    generatedEnvironmentsClass,
                    generatedClientOptions,
                    generatedErrors);
            return noRequestEndpointWriter.generate();
        }
    }

    public List<GeneratedWrappedRequest> getGeneratedWrappedRequests() {
        return generatedWrappedRequests;
    }
}
