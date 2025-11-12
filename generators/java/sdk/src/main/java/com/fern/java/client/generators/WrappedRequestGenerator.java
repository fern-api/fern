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
import com.fern.java.client.generators.endpoint.DefaultValueExtractor;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.generators.ObjectGenerator;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObject;
import com.squareup.javapoet.ClassName;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public final class WrappedRequestGenerator extends AbstractFileGenerator {
    private final HttpService httpService;
    private final HttpEndpoint httpEndpoint;
    private final SdkRequestWrapper sdkRequestWrapper;
    private final Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces;
    private final boolean inlinePathParams;
    private final boolean inlineFileProperties;
    private final DefaultValueExtractor defaultValueExtractor;

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
        this.inlineFileProperties = generatorContext.getCustomConfig().inlineFileProperties()
                && httpEndpoint.getRequestBody().isPresent()
                && httpEndpoint.getRequestBody().get().isFileUpload();
        this.defaultValueExtractor = new DefaultValueExtractor(generatorContext);
    }

    @Override
    public GeneratedWrappedRequest generateFile() {
        List<ObjectProperty> headerObjectProperties = new ArrayList<>();
        List<ObjectProperty> queryParameterObjectProperties = new ArrayList<>();
        List<ObjectProperty> queryParameterAllowMultipleObjectProperties = new ArrayList<>();
        List<ObjectProperty> pathParameterObjectProperties = new ArrayList<>();
        List<ObjectProperty> fileObjectProperties = new ArrayList<>();
        List<DeclaredTypeName> extendedInterfaces = new ArrayList<>();
        httpService.getHeaders().forEach(httpHeader -> {
            TypeReference valueType = httpHeader.getValueType();
            if (defaultValueExtractor.hasDefaultValue(valueType)) {
                valueType = TypeReference.container(ContainerType.optional(valueType));
            }
            // Create header property with modified name that has NO wire value
            // This ensures the property gets @JsonIgnore instead of @JsonProperty
            // Headers should only be sent as HTTP headers, not in JSON body
            NameAndWireValue nameWithoutWire = NameAndWireValue.builder()
                    .wireValue("") // Empty wire value → @JsonIgnore
                    .name(httpHeader.getName().getName())
                    .build();
            headerObjectProperties.add(ObjectProperty.builder()
                    .name(nameWithoutWire)
                    .valueType(valueType)
                    .docs(httpHeader.getDocs())
                    .build());
        });
        httpEndpoint.getHeaders().forEach(httpHeader -> {
            TypeReference valueType = httpHeader.getValueType();
            if (defaultValueExtractor.hasDefaultValue(valueType)) {
                valueType = TypeReference.container(ContainerType.optional(valueType));
            }
            // Create header property with modified name that has NO wire value
            // This ensures the property gets @JsonIgnore instead of @JsonProperty
            // Headers should only be sent as HTTP headers, not in JSON body
            NameAndWireValue nameWithoutWire = NameAndWireValue.builder()
                    .wireValue("") // Empty wire value → @JsonIgnore
                    .name(httpHeader.getName().getName())
                    .build();
            headerObjectProperties.add(ObjectProperty.builder()
                    .name(nameWithoutWire)
                    .valueType(valueType)
                    .docs(httpHeader.getDocs())
                    .build());
        });
        httpEndpoint.getQueryParameters().forEach(queryParameter -> {
            TypeReference valueType = queryParameter.getValueType();
            boolean hasDefault = defaultValueExtractor.hasDefaultValue(valueType);
            if (hasDefault) {
                valueType = TypeReference.container(ContainerType.optional(valueType));
            }
            if (queryParameter.getAllowMultiple()) {
                queryParameterAllowMultipleObjectProperties.add(ObjectProperty.builder()
                        .name(queryParameter.getName())
                        .valueType(valueType)
                        .docs(queryParameter.getDocs())
                        .build());
            } else {
                queryParameterObjectProperties.add(ObjectProperty.builder()
                        .name(queryParameter.getName())
                        .valueType(valueType)
                        .docs(queryParameter.getDocs())
                        .build());
            }
        });

        if (inlinePathParams) {
            httpEndpoint.getPathParameters().stream()
                    .filter(param -> param.getLocation().equals(PathParameterLocation.ENDPOINT))
                    .forEach(pathParameter -> {
                        TypeReference valueType = pathParameter.getValueType();
                        if (defaultValueExtractor.hasDefaultValue(valueType)) {
                            valueType = TypeReference.container(ContainerType.optional(valueType));
                        }
                        pathParameterObjectProperties.add(ObjectProperty.builder()
                                .name(NameAndWireValue.builder()
                                        .wireValue(pathParameter.getName().getOriginalName())
                                        .name(pathParameter.getName())
                                        .build())
                                .valueType(valueType)
                                .docs(pathParameter.getDocs())
                                .build());
                    });
        }

        if (inlineFileProperties) {
            FileUploadRequest fileUploadRequest =
                    httpEndpoint.getRequestBody().get().getFileUpload().get();
            fileUploadRequest.getProperties().stream()
                    .flatMap(property -> property.getFile().stream())
                    .forEach(fileProperty -> {
                        NameAndWireValue name = fileProperty.visit(new FileProperty.Visitor<NameAndWireValue>() {
                            @Override
                            public NameAndWireValue visitFile(FilePropertySingle filePropertySingle) {
                                return filePropertySingle.getKey();
                            }

                            @Override
                            public NameAndWireValue visitFileArray(FilePropertyArray filePropertyArray) {
                                return filePropertyArray.getKey();
                            }

                            @Override
                            public NameAndWireValue _visitUnknown(Object o) {
                                throw new RuntimeException("Received unknown file property type: " + o);
                            }
                        });
                        // NOTE: See ObjectGenerator#enrichedObjectProperties for why we do this.
                        TypeReference valueType = fileProperty.visit(new FileProperty.Visitor<TypeReference>() {
                            @Override
                            public TypeReference visitFile(FilePropertySingle filePropertySingle) {
                                TypeReference type = TypeReference.unknown();
                                if (filePropertySingle.getIsOptional()) {
                                    type = TypeReference.container(ContainerType.optional(type));
                                }
                                return type;
                            }

                            @Override
                            public TypeReference visitFileArray(FilePropertyArray filePropertyArray) {
                                TypeReference type =
                                        TypeReference.container(ContainerType.list(TypeReference.unknown()));
                                if (filePropertyArray.getIsOptional()) {
                                    type = TypeReference.container(ContainerType.optional(type));
                                }
                                return type;
                            }

                            @Override
                            public TypeReference _visitUnknown(Object o) {
                                throw new RuntimeException("Received unknown file property type: " + o);
                            }
                        });
                        fileObjectProperties.add(ObjectProperty.builder()
                                .name(name)
                                .valueType(valueType)
                                // TODO(ajgateno): Propagate docs
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
        ObjectGenerator objectGenerator = new ObjectGenerator(
                objectTypeDeclaration,
                Optional.empty(),
                extendedInterfaces.stream()
                        .map(DeclaredTypeName::getTypeId)
                        .map(allGeneratedInterfaces::get)
                        .collect(Collectors.toList()),
                generatorContext,
                allGeneratedInterfaces,
                className,
                Set.of(className.simpleName()),
                true,
                fileObjectProperties,
                queryParameterAllowMultipleObjectProperties);
        GeneratedObject generatedObject = objectGenerator.generateObject();
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
                .addAllQueryParams(queryParameterAllowMultipleObjectProperties.stream()
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
            // Check if the content type is application/x-www-form-urlencoded
            if (_inlinedRequestBody.getContentType().isPresent()
                    && _inlinedRequestBody.getContentType().get().equals("application/x-www-form-urlencoded")) {
                return GeneratedWrappedRequest.UrlFormEncodedGetters.builder()
                        .addAllProperties(requestBodyProperties.stream()
                                .map(objectProperty ->
                                        generatedObject.objectPropertyGetters().get(objectProperty))
                                .collect(Collectors.toList()))
                        .addAllProperties(generatedObject.extendedObjectPropertyGetters())
                        .build();
            }

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
                    EnrichedObjectProperty enrichedObjectProperty =
                            generatedObject.objectPropertyGetters().get(requestBodyProperties.get(jsonPropertyIndex));
                    fileUploadProperties.add(JsonFileUploadProperty.builder()
                            .objectProperty(enrichedObjectProperty)
                            .rawProperty(irFileUploadProperty.getBodyProperty().get())
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
            throw new RuntimeException("Encountered unknown http request body: " + unknownType);
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
            throw new RuntimeException("Encountered unknown http request body: " + unknownType);
        }
    }
}
