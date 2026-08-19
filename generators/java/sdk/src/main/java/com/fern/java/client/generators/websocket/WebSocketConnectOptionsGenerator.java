/*
 * (c) Copyright 2025 Birch Solutions Inc. All rights reserved.
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

package com.fern.java.client.generators.websocket;

import com.fern.ir.model.http.QueryParameter;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.ir.model.websocket.WebSocketChannel;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.generators.endpoint.DefaultValueExtractor;
import com.fern.java.generators.ObjectGenerator;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedObject;
import com.squareup.javapoet.ClassName;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Generates a connect options class with a builder for WebSocket channel query parameters. Uses the existing
 * ObjectGenerator pipeline to produce staged builders (for required params) or default builders (for all-optional
 * params).
 */
public class WebSocketConnectOptionsGenerator {

    private final WebSocketChannel websocketChannel;
    private final ClientGeneratorContext generatorContext;
    private final ClassName className;
    private final DefaultValueExtractor defaultValueExtractor;

    // Track query params for later use by channel writers
    private final List<ObjectProperty> queryParameterObjectProperties = new ArrayList<>();
    private final List<ObjectProperty> queryParameterAllowMultipleProperties = new ArrayList<>();

    // After generation, maps ObjectProperty → EnrichedObjectProperty for getter access
    private Map<ObjectProperty, EnrichedObjectProperty> objectPropertyGetters = Collections.emptyMap();

    public WebSocketConnectOptionsGenerator(
            WebSocketChannel websocketChannel, ClientGeneratorContext generatorContext, ClassName className) {
        this.websocketChannel = websocketChannel;
        this.generatorContext = generatorContext;
        this.className = className;
        this.defaultValueExtractor = new DefaultValueExtractor(generatorContext);
    }

    public GeneratedJavaFile generateFile() {
        // Convert query parameters to ObjectProperty lists
        for (QueryParameter queryParam : websocketChannel.getQueryParameters()) {
            TypeReference valueType = queryParam.getValueType();
            boolean hasDefault = defaultValueExtractor.hasDefaultValue(valueType);
            if (hasDefault) {
                valueType = TypeReference.container(ContainerType.optional(valueType));
            }

            ObjectProperty objectProperty = ObjectProperty.builder()
                    .name(queryParam.getName())
                    .valueType(valueType)
                    .docs(queryParam.getDocs())
                    .build();

            if (queryParam.getAllowMultiple()) {
                queryParameterAllowMultipleProperties.add(objectProperty);
            } else {
                queryParameterObjectProperties.add(objectProperty);
            }
        }

        // Build ObjectTypeDeclaration from query params
        ObjectTypeDeclaration objectTypeDeclaration = ObjectTypeDeclaration.builder()
                .extraProperties(false)
                .addAllProperties(queryParameterObjectProperties)
                .build();

        // Generate via ObjectGenerator
        ObjectGenerator objectGenerator = new ObjectGenerator(
                objectTypeDeclaration,
                Optional.empty(),
                Collections.emptyList(),
                generatorContext,
                Collections.emptyMap(),
                className,
                Set.of(className.simpleName()),
                true,
                Collections.emptyList(),
                queryParameterAllowMultipleProperties);
        GeneratedObject generatedObject = objectGenerator.generateObject();

        // Store property getters for use by channel writers
        this.objectPropertyGetters = new LinkedHashMap<>(generatedObject.objectPropertyGetters());

        return GeneratedJavaFile.builder()
                .className(generatedObject.getClassName())
                .javaFile(generatedObject.javaFile())
                .build();
    }

    /** Returns the list of regular query parameter ObjectProperties. Valid after generateFile() has been called. */
    public List<ObjectProperty> getQueryParameterProperties() {
        return queryParameterObjectProperties;
    }

    /**
     * Returns the list of allow-multiple query parameter ObjectProperties. Valid after generateFile() has been called.
     */
    public List<ObjectProperty> getAllowMultipleProperties() {
        return queryParameterAllowMultipleProperties;
    }

    /**
     * Returns the mapping from ObjectProperty to EnrichedObjectProperty, which provides getter method names and
     * JavaPoet type names. Valid after generateFile() has been called.
     */
    public Map<ObjectProperty, EnrichedObjectProperty> getObjectPropertyGetters() {
        return objectPropertyGetters;
    }

    public ClassName getClassName() {
        return className;
    }
}
