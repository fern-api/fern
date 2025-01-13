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
package com.fern.java.generators;

import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.PoetTypeNameMapper;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.generators.object.ImplementsInterface;
import com.fern.java.generators.object.ObjectTypeSpecGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObject;
import com.google.common.collect.ImmutableMap;
import com.palantir.common.streams.KeyedStream;
import com.squareup.javapoet.ClassName;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Queue;
import java.util.Set;
import java.util.stream.Collectors;

public final class ObjectGenerator extends AbstractTypeGenerator {
    private final List<EnrichedObjectProperty> enrichedObjectProperties;
    private final Map<ObjectProperty, EnrichedObjectProperty> objectPropertyGetters;
    private final List<ImplementsInterface> implementsInterfaces;
    private final List<EnrichedObjectProperty> extendedPropertyGetters;

    public ObjectGenerator(
            ObjectTypeDeclaration objectTypeDeclaration,
            Optional<GeneratedJavaInterface> selfInterface,
            List<GeneratedJavaInterface> extendedInterfaces,
            AbstractGeneratorContext<?, ?> generatorContext,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces,
            ClassName className,
            Set<String> reservedTypeNames) {
        super(className, generatorContext, reservedTypeNames);
        List<GeneratedJavaInterface> allExtendedInterfaces = new ArrayList<>();
        selfInterface.ifPresent(allExtendedInterfaces::add);
        allExtendedInterfaces.addAll(extendedInterfaces);
        this.enrichedObjectProperties = enrichedObjectProperties(
                selfInterface, objectTypeDeclaration, generatorContext.getPoetTypeNameMapper());
        List<GeneratedJavaInterface> ancestors =
                getUniqueAncestorsInLevelOrder(allExtendedInterfaces, allGeneratedInterfaces);
        this.implementsInterfaces = implementsInterfaces(ancestors);
        this.extendedPropertyGetters = implementsInterfaces.stream()
                .map(ImplementsInterface::interfaceProperties)
                .flatMap(List::stream)
                .collect(Collectors.toList());
        this.objectPropertyGetters = ImmutableMap.<ObjectProperty, EnrichedObjectProperty>builder()
                .putAll(KeyedStream.of(enrichedObjectProperties.stream())
                        .mapKeys(EnrichedObjectProperty::objectProperty)
                        .collectToMap())
                .putAll(KeyedStream.of(extendedPropertyGetters.stream())
                        .mapKeys(EnrichedObjectProperty::objectProperty)
                        .collectToMap())
                .build();
        ObjectTypeSpecGenerator genericObjectGenerator = new ObjectTypeSpecGenerator(
                className,
                generatorContext.getPoetClassNameFactory().getObjectMapperClassName(),
                enrichedObjectProperties,
                implementsInterfaces,
                true,
                generatorContext.getCustomConfig().enablePublicConstructors(),
                generatorContext.deserializeWithAdditionalProperties(),
                generatorContext.getCustomConfig().jsonInclude(),
                generatorContext.getCustomConfig().disableRequiredPropertyBuilderChecks(),
                generatorContext.builderNotNullChecks());
        this.typeSpec = genericObjectGenerator.generate();
    }

    public GeneratedObject generateObject() {
        GeneratedJavaFile javaFile = generateFile();
        return GeneratedObject.builder()
                .className(className)
                .javaFile(javaFile.javaFile())
                .putAllObjectPropertyGetters(objectPropertyGetters)
                .addAllExtendedObjectPropertyGetters(extendedPropertyGetters)
                .build();
    }

    private static List<ImplementsInterface> implementsInterfaces(List<GeneratedJavaInterface> ancestors) {
        return ancestors.stream()
                .map(generatedInterface -> ImplementsInterface.builder()
                        .interfaceClassName(generatedInterface.getClassName())
                        .addAllInterfaceProperties(getEnrichedObjectProperties(generatedInterface))
                        .build())
                .collect(Collectors.toList());
    }

    private static List<EnrichedObjectProperty> enrichedObjectProperties(
            Optional<GeneratedJavaInterface> selfInterface,
            ObjectTypeDeclaration objectTypeDeclaration,
            PoetTypeNameMapper poetTypeNameMapper) {
        if (selfInterface.isEmpty()) {
            return objectTypeDeclaration.getProperties().stream()
                    .map(objectProperty -> EnrichedObjectProperty.of(
                            objectProperty,
                            false,
                            poetTypeNameMapper.convertToTypeName(true, objectProperty.getValueType())))
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    private static List<EnrichedObjectProperty> getEnrichedObjectProperties(
            GeneratedJavaInterface generatedJavaInterface) {
        return generatedJavaInterface.propertyMethodSpecs().stream()
                .map(propertyMethodSpec -> EnrichedObjectProperty.of(
                        propertyMethodSpec.objectProperty(), true, propertyMethodSpec.methodSpec().returnType))
                .collect(Collectors.toList());
    }

    /** Gets all ancestors under the interface implementation relation exactly once, in level order. */
    private static List<GeneratedJavaInterface> getUniqueAncestorsInLevelOrder(
            List<GeneratedJavaInterface> extendedInterfaces,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces) {
        List<GeneratedJavaInterface> result = new ArrayList<>();

        Set<GeneratedJavaInterface> visited = new HashSet<>();
        for (GeneratedJavaInterface extendedInterface : extendedInterfaces) {
            Queue<GeneratedJavaInterface> interfaceQueue = new LinkedList<>();
            interfaceQueue.add(extendedInterface);
            while (!interfaceQueue.isEmpty()) {
                GeneratedJavaInterface curr = interfaceQueue.poll();
                if (!visited.contains(curr)) {
                    visited.add(curr);
                    result.add(curr);
                    interfaceQueue.addAll(curr.extendedInterfaces().stream()
                            .map(DeclaredTypeName::getTypeId)
                            .map(allGeneratedInterfaces::get)
                            .collect(Collectors.toList()));
                }
            }
        }

        return result;
    }
}
