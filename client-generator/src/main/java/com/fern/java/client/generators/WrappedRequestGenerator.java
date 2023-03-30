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

import com.fern.ir.v9.model.commons.Name;
import com.fern.ir.v9.model.commons.NameAndWireValue;
import com.fern.ir.v9.model.commons.TypeId;
import com.fern.ir.v9.model.declaration.Availability;
import com.fern.ir.v9.model.declaration.AvailabilityStatus;
import com.fern.ir.v9.model.http.HttpEndpoint;
import com.fern.ir.v9.model.http.HttpRequestBody;
import com.fern.ir.v9.model.http.HttpRequestBodyReference;
import com.fern.ir.v9.model.http.HttpService;
import com.fern.ir.v9.model.http.InlinedRequestBody;
import com.fern.ir.v9.model.http.SdkRequestWrapper;
import com.fern.ir.v9.model.types.DeclaredTypeName;
import com.fern.ir.v9.model.types.ObjectProperty;
import com.fern.ir.v9.model.types.ObjectTypeDeclaration;
import com.fern.java.InlinedRequestBodyUtils;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedWrappedRequest;
import com.fern.java.client.GeneratedWrappedRequest.InlinedRequestBodyGetters;
import com.fern.java.client.GeneratedWrappedRequest.ReferencedRequestBodyGetter;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.generators.ObjectGenerator;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObject;
import com.squareup.javapoet.ClassName;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public final class WrappedRequestGenerator extends AbstractFileGenerator {
    private final HttpService httpService;
    private final HttpEndpoint httpEndpoint;
    private final SdkRequestWrapper sdkRequestWrapper;
    private final Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces;

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
    }

    @Override
    public GeneratedWrappedRequest generateFile() {
        List<ObjectProperty> headerObjectProperties = new ArrayList<>();
        List<ObjectProperty> queryParameterObjectProperties = new ArrayList<>();
        List<ObjectProperty> inlinedObjectProperties = new ArrayList<>();
        List<ObjectProperty> referencedObjectProperties = new ArrayList<>();
        List<DeclaredTypeName> extendedInterfaces = new ArrayList<>();
        httpService.getHeaders().forEach(httpHeader -> {
            headerObjectProperties.add(ObjectProperty.builder()
                    .availability(Availability.builder()
                            .status(AvailabilityStatus.GENERAL_AVAILABILITY)
                            .build())
                    .name(httpHeader.getName())
                    .valueType(httpHeader.getValueType())
                    .docs(httpHeader.getDocs())
                    .build());
        });
        httpEndpoint.getHeaders().forEach(httpHeader -> {
            headerObjectProperties.add(ObjectProperty.builder()
                    .availability(Availability.builder()
                            .status(AvailabilityStatus.GENERAL_AVAILABILITY)
                            .build())
                    .name(httpHeader.getName())
                    .valueType(httpHeader.getValueType())
                    .docs(httpHeader.getDocs())
                    .build());
        });
        httpEndpoint.getQueryParameters().forEach(queryParameter -> {
            queryParameterObjectProperties.add(ObjectProperty.builder()
                    .availability(Availability.builder()
                            .status(AvailabilityStatus.GENERAL_AVAILABILITY)
                            .build())
                    .name(queryParameter.getName())
                    .valueType(queryParameter.getValueType())
                    .docs(queryParameter.getDocs())
                    .build());
        });
        Optional<Boolean> isInline = httpEndpoint
                .getRequestBody()
                .map(httpRequestBody -> httpRequestBody.visit(new HttpRequestBody.Visitor<Boolean>() {
                    @Override
                    public Boolean visitInlinedRequestBody(InlinedRequestBody inlinedRequestBody) {
                        extendedInterfaces.addAll(inlinedRequestBody.getExtends());
                        inlinedObjectProperties.addAll(
                                InlinedRequestBodyUtils.convertToObjectProperties(inlinedRequestBody));
                        return true;
                    }

                    @Override
                    public Boolean visitReference(HttpRequestBodyReference reference) {
                        referencedObjectProperties.add(ObjectProperty.builder()
                                .availability(Availability.builder()
                                        .status(AvailabilityStatus.GENERAL_AVAILABILITY)
                                        .build())
                                .name(NameAndWireValue.builder()
                                        .wireValue(
                                                sdkRequestWrapper.getBodyKey().getOriginalName())
                                        .name(Name.builder()
                                                .originalName(sdkRequestWrapper
                                                        .getBodyKey()
                                                        .getOriginalName())
                                                .camelCase(sdkRequestWrapper
                                                        .getBodyKey()
                                                        .getCamelCase())
                                                .pascalCase(sdkRequestWrapper
                                                        .getBodyKey()
                                                        .getPascalCase())
                                                .snakeCase(sdkRequestWrapper
                                                        .getBodyKey()
                                                        .getSnakeCase())
                                                .screamingSnakeCase(sdkRequestWrapper
                                                        .getBodyKey()
                                                        .getScreamingSnakeCase())
                                                .build())
                                        .build())
                                .valueType(reference.getRequestBodyType())
                                .docs(reference.getDocs())
                                .build());
                        return false;
                    }

                    @Override
                    public Boolean _visitUnknown(Object unknownType) {
                        throw new RuntimeException("Encountered unknown request body type" + unknownType);
                    }
                }));
        ObjectTypeDeclaration objectTypeDeclaration = ObjectTypeDeclaration.builder()
                .addAllExtends(extendedInterfaces)
                .addAllProperties(headerObjectProperties)
                .addAllProperties(queryParameterObjectProperties)
                .addAllProperties(inlinedObjectProperties)
                .addAllProperties(referencedObjectProperties)
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
                className);
        GeneratedObject generatedObject = objectGenerator.generateFile();
        return GeneratedWrappedRequest.builder()
                .className(generatedObject.getClassName())
                .javaFile(generatedObject.javaFile())
                .requestBodyGetter(isInline.map(isInlineValue -> isInlineValue
                        ? InlinedRequestBodyGetters.builder()
                                .addAllProperties(inlinedObjectProperties.stream()
                                        .map(objectProperty -> generatedObject
                                                .objectPropertyGetters()
                                                .get(objectProperty))
                                        .collect(Collectors.toList()))
                                .build()
                        : ReferencedRequestBodyGetter.builder()
                                .requestBodyGetter(generatedObject
                                        .objectPropertyGetters()
                                        .get(referencedObjectProperties.get(0))
                                        .getterProperty())
                                .build()))
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
}
