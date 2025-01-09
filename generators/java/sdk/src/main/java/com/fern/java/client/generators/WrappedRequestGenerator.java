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

package com.fern.java.client.generators;

import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.NameAndWireValue;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.http.*;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.ir.model.types.PrimitiveTypeV1;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.RequestBodyUtils;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedWrappedRequest;
import com.fern.java.client.GeneratedWrappedRequest.FilePropertyContainer;
import com.fern.java.client.GeneratedWrappedRequest.FileUploadProperty;
import com.fern.java.client.GeneratedWrappedRequest.FileUploadRequestBodyGetters;
import com.fern.java.client.GeneratedWrappedRequest.InlinedRequestBodyGetters;
import com.fern.java.client.GeneratedWrappedRequest.JsonFileUploadProperty;
import com.fern.java.client.GeneratedWrappedRequest.ReferencedRequestBodyGetter;
import com.fern.java.client.GeneratedWrappedRequest.RequestBodyGetter;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.generators.ObjectGenerator;
import com.fern.java.generators.object.ObjectTypeSpecGenerator;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObject;
import com.squareup.javapoet.ClassName;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public final class WrappedRequestGenerator extends AbstractFileGenerator {
    private final HttpService httpService;
    private final HttpEndpoint httpEndpoint;
    private final SdkRequestWrapper sdkRequestWrapper;
    private final Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces;
    private final boolean inlinePathParams;

    public WrappedRequestGenerator(
            SdkRequestWrapper sdkRequestWrapper,
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            ClassName className,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces,
            ClientGeneratorContext generatorContext) {
        super(className, generatorContext);
        this.httpService = httpService;
        this.httpEndpoint = httpEndpoint;
        this.sdkRequestWrapper = sdkRequestWrapper;
        this.allGeneratedInterfaces = allGeneratedInterfaces;
        this.inlinePathParams = generatorContext.getCustomConfig().inlinePathParameters()
                && httpEndpoint.getSdkRequest().isPresent()
                && httpEndpoint.getSdkRequest().get().getShape().isWrapper()
                && (httpEndpoint
                                .getSdkRequest()
                                .get()
                                .getShape()
                                .getWrapper()
                                .get()
                                .getIncludePathParameters()
                                .orElse(false)
                        || httpEndpoint
                                .getSdkRequest()
                                .get()
                                .getShape()
                                .getWrapper()
                                .get()
                                .getOnlyPathParameters()
                                .orElse(false));
    }

    @Override
    public GeneratedWrappedRequest generateFile() {
        List<ObjectProperty> headerObjectProperties = new ArrayList<>();
        List<ObjectProperty> queryParameterObjectProperties = new ArrayList<>();
        List<ObjectProperty> pathParameterObjectProperties = new ArrayList<>();
        List<DeclaredTypeName> extendedInterfaces = new ArrayList<>();
        httpService.getHeaders().forEach(httpHeader -> {
            headerObjectProperties.add(ObjectProperty.builder()
                    .name(httpHeader.getName())
                    .valueType(httpHeader.getValueType())
                    .docs(httpHeader.getDocs())
                    .build());
        });
        httpEndpoint.getHeaders().forEach(httpHeader -> {
            headerObjectProperties.add(ObjectProperty.builder()
                    .name(httpHeader.getName())
                    .valueType(httpHeader.getValueType())
                    .docs(httpHeader.getDocs())
                    .build());
        });
        httpEndpoint.getQueryParameters().forEach(queryParameter -> {
            queryParameterObjectProperties.add(ObjectProperty.builder()
                    .name(queryParameter.getName())
                    .valueType(queryParameter.getValueType())
                    .docs(queryParameter.getDocs())
                    .build());
        });

        if (inlinePathParams) {
            httpEndpoint.getPathParameters().stream()
                    .filter(param -> param.getLocation().equals(PathParameterLocation.ENDPOINT))
                    .forEach(pathParameter -> {
                        pathParameterObjectProperties.add(ObjectProperty.builder()
                                .name(NameAndWireValue.builder()
                                        .wireValue(pathParameter.getName().getOriginalName())
                                        .name(pathParameter.getName())
                                        .build())
                                .valueType(pathParameter.getValueType())
                                .docs(pathParameter.getDocs())
                                .build());
                    });
        }

        RequestBodyPropertiesComputer requestBodyPropertiesComputer =
                new RequestBodyPropertiesComputer(extendedInterfaces);
        List<ObjectProperty> objectProperties = httpEndpoint
                .getRequestBody()
                .map(httpRequestBody -> httpRequestBody.visit(requestBodyPropertiesComputer))
                .orElseGet(Collections::emptyList);
        ObjectTypeDeclaration objectTypeDeclaration = ObjectTypeDeclaration.builder()
                .extraProperties(false)
                .addAllExtends(extendedInterfaces)
                .addAllProperties(pathParameterObjectProperties)
                .addAllProperties(headerObjectProperties)
                .addAllProperties(queryParameterObjectProperties)
                .addAllProperties(objectProperties)
                .build();
        ObjectTypeSpecGenerator objectTypeSpecGenerator = new ObjectTypeSpecGenerator(
                objectTypeDeclaration,
                Optional.empty(),
                extendedInterfaces.stream()
                        .map(DeclaredTypeName::getTypeId)
                        .map(allGeneratedInterfaces::get)
                        .collect(Collectors.toList()),
                generatorContext,
                allGeneratedInterfaces,
                className);
        ObjectGenerator objectGenerator = new ObjectGenerator(
                generatorContext,
                className,
                objectTypeSpecGenerator.generate(),
                objectTypeSpecGenerator.objectPropertyGetters(),
                objectTypeSpecGenerator.extendedPropertyGetters());
        GeneratedObject generatedObject = objectGenerator.generateFile();
        RequestBodyGetterFactory requestBodyGetterFactory =
                new RequestBodyGetterFactory(objectProperties, generatedObject);
        return GeneratedWrappedRequest.builder()
                .className(generatedObject.getClassName())
                .javaFile(generatedObject.javaFile())
                .requestBodyGetter(httpEndpoint
                        .getRequestBody()
                        .map(httpRequestBody -> httpRequestBody.visit(requestBodyGetterFactory)))
                .addAllPathParams(pathParameterObjectProperties.stream()
                        .map(objectProperty ->
                                generatedObject.objectPropertyGetters().get(objectProperty))
                        .collect(Collectors.toList()))
                .addAllHeaderParams(headerObjectProperties.stream()
                        .map(objectProperty ->
                                generatedObject.objectPropertyGetters().get(objectProperty))
                        .collect(Collectors.toList()))
                .addAllQueryParams(queryParameterObjectProperties.stream()
                        .map(objectProperty ->
                                generatedObject.objectPropertyGetters().get(objectProperty))
                        .collect(Collectors.toList()))
                .build();
    }

    private static final class RequestBodyGetterFactory implements HttpRequestBody.Visitor<RequestBodyGetter> {

        private final List<ObjectProperty> requestBodyProperties;
        private final GeneratedObject generatedObject;

        RequestBodyGetterFactory(List<ObjectProperty> requestBodyProperties, GeneratedObject generatedObject) {
            this.requestBodyProperties = requestBodyProperties;
            this.generatedObject = generatedObject;
        }

        @Override
        public RequestBodyGetter visitInlinedRequestBody(InlinedRequestBody _inlinedRequestBody) {
            return InlinedRequestBodyGetters.builder()
                    .addAllProperties(requestBodyProperties.stream()
                            .map(objectProperty ->
                                    generatedObject.objectPropertyGetters().get(objectProperty))
                            .collect(Collectors.toList()))
                    .addAllProperties(generatedObject.extendedObjectPropertyGetters())
                    .build();
        }

        @Override
        public RequestBodyGetter visitReference(HttpRequestBodyReference reference) {
            return ReferencedRequestBodyGetter.builder()
                    .requestBodyGetter(generatedObject
                            .objectPropertyGetters()
                            .get(requestBodyProperties.get(0))
                            .getterProperty())
                    .build();
        }

        @Override
        public RequestBodyGetter visitFileUpload(FileUploadRequest fileUpload) {
            List<FileUploadProperty> fileUploadProperties = new ArrayList<>();
            int jsonPropertyIndex = 0;
            for (FileUploadRequestProperty irFileUploadProperty : fileUpload.getProperties()) {
                if (irFileUploadProperty.isFile()) {
                    fileUploadProperties.add(FilePropertyContainer.builder()
                            .fileProperty(irFileUploadProperty.getFile().get())
                            .build());
                } else if (irFileUploadProperty.isBodyProperty()) {
                    fileUploadProperties.add(JsonFileUploadProperty.builder()
                            .objectProperty(generatedObject
                                    .objectPropertyGetters()
                                    .get(requestBodyProperties.get(jsonPropertyIndex)))
                            .build());
                    ++jsonPropertyIndex;
                }
            }
            return FileUploadRequestBodyGetters.builder()
                    .addAllProperties(fileUploadProperties)
                    .addAllFileProperties(fileUpload.getProperties().stream()
                            .map(FileUploadRequestProperty::getFile)
                            .flatMap(Optional::stream)
                            .collect(Collectors.toList()))
                    .build();
        }

        @Override
        public RequestBodyGetter visitBytes(BytesRequest bytes) {
            return ReferencedRequestBodyGetter.builder()
                    .requestBodyGetter(generatedObject
                            .objectPropertyGetters()
                            .get(requestBodyProperties.get(0))
                            .getterProperty())
                    .build();
        }

        @Override
        public RequestBodyGetter _visitUnknown(Object unknownType) {
            throw new RuntimeException("Encountered unknown http requeset body: " + unknownType);
        }
    }

    private final class RequestBodyPropertiesComputer implements HttpRequestBody.Visitor<List<ObjectProperty>> {

        private final List<DeclaredTypeName> extendedInterfaces;

        private RequestBodyPropertiesComputer(List<DeclaredTypeName> extendedInterfaces) {
            this.extendedInterfaces = extendedInterfaces;
        }

        @Override
        public List<ObjectProperty> visitInlinedRequestBody(InlinedRequestBody inlinedRequestBody) {
            List<ObjectProperty> inlinedObjectProperties = new ArrayList<>();
            extendedInterfaces.addAll(inlinedRequestBody.getExtends());
            inlinedObjectProperties.addAll(RequestBodyUtils.convertToObjectProperties(inlinedRequestBody));
            return inlinedObjectProperties;
        }

        @Override
        public List<ObjectProperty> visitReference(HttpRequestBodyReference reference) {
            return List.of(ObjectProperty.builder()
                    .name(NameAndWireValue.builder()
                            .wireValue(sdkRequestWrapper.getBodyKey().getOriginalName())
                            .name(Name.builder()
                                    .originalName(sdkRequestWrapper.getBodyKey().getOriginalName())
                                    .camelCase(sdkRequestWrapper.getBodyKey().getCamelCase())
                                    .pascalCase(sdkRequestWrapper.getBodyKey().getPascalCase())
                                    .snakeCase(sdkRequestWrapper.getBodyKey().getSnakeCase())
                                    .screamingSnakeCase(
                                            sdkRequestWrapper.getBodyKey().getScreamingSnakeCase())
                                    .build())
                            .build())
                    .valueType(reference.getRequestBodyType())
                    .docs(reference.getDocs())
                    .build());
        }

        @Override
        public List<ObjectProperty> visitFileUpload(FileUploadRequest fileUpload) {
            List<ObjectProperty> inlinedObjectProperties = new ArrayList<>();
            inlinedObjectProperties.addAll(RequestBodyUtils.convertToObjectProperties(fileUpload));
            return inlinedObjectProperties;
        }

        @Override
        public List<ObjectProperty> visitBytes(BytesRequest bytes) {
            TypeReference base64TypeReference = TypeReference.primitive(
                    PrimitiveType.builder().v1(PrimitiveTypeV1.BASE_64).build());
            return List.of(ObjectProperty.builder()
                    .name(NameAndWireValue.builder()
                            .wireValue(sdkRequestWrapper.getBodyKey().getOriginalName())
                            .name(Name.builder()
                                    .originalName(sdkRequestWrapper.getBodyKey().getOriginalName())
                                    .camelCase(sdkRequestWrapper.getBodyKey().getCamelCase())
                                    .pascalCase(sdkRequestWrapper.getBodyKey().getPascalCase())
                                    .snakeCase(sdkRequestWrapper.getBodyKey().getSnakeCase())
                                    .screamingSnakeCase(
                                            sdkRequestWrapper.getBodyKey().getScreamingSnakeCase())
                                    .build())
                            .build())
                    .valueType(
                            bytes.getIsOptional()
                                    ? TypeReference.container(ContainerType.optional(base64TypeReference))
                                    : base64TypeReference)
                    .build());
        }

        @Override
        public List<ObjectProperty> _visitUnknown(Object unknownType) {
            throw new RuntimeException("Encountered unknown http requeset body: " + unknownType);
        }
    }
}
