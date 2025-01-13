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
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Queue;
import java.util.Set;
import java.util.stream.Collectors;

public final class ObjectGenerator extends AbstractFileGenerator {
    private final ObjectTypeDeclaration objectTypeDeclaration;
    private final Optional<GeneratedJavaInterface> selfInterface;
    private final Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces;
    private final List<GeneratedJavaInterface> extendedInterfaces = new ArrayList<>();
    private Map<ObjectProperty, EnrichedObjectProperty> objectPropertyGetters = new HashMap<>();
    private List<EnrichedObjectProperty> extendedPropertyGetters = new ArrayList<>();

    public ObjectGenerator(
            ObjectTypeDeclaration objectTypeDeclaration,
            Optional<GeneratedJavaInterface> selfInterface,
            List<GeneratedJavaInterface> extendedInterfaces,
            AbstractGeneratorContext<?, ?> generatorContext,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces,
            ClassName className) {
        super(className, generatorContext);
        this.objectTypeDeclaration = objectTypeDeclaration;
        this.selfInterface = selfInterface;
        selfInterface.ifPresent(this.extendedInterfaces::add);
        this.extendedInterfaces.addAll(extendedInterfaces);
        this.allGeneratedInterfaces = allGeneratedInterfaces;
    }

    public GeneratedObject generateObject() {
        reset();
        GeneratedJavaFile javaFile = generateFile();
        return GeneratedObject.builder()
                .className(className)
                .javaFile(javaFile.javaFile())
                .putAllObjectPropertyGetters(objectPropertyGetters)
                .addAllExtendedObjectPropertyGetters(extendedPropertyGetters)
                .build();
    }

    @Override
    public GeneratedJavaFile generateFile() {
        reset();
        PoetTypeNameMapper poetTypeNameMapper = generatorContext.getPoetTypeNameMapper();
        List<EnrichedObjectProperty> enrichedObjectProperties = new ArrayList<>();
        if (selfInterface.isEmpty()) {
            enrichedObjectProperties = objectTypeDeclaration.getProperties().stream()
                    .map(objectProperty -> EnrichedObjectProperty.of(
                            objectProperty,
                            false,
                            poetTypeNameMapper.convertToTypeName(true, objectProperty.getValueType())))
                    .collect(Collectors.toList());
            for (EnrichedObjectProperty enrichedObjectProperty : enrichedObjectProperties) {
                objectPropertyGetters.put(enrichedObjectProperty.objectProperty(), enrichedObjectProperty);
            }
        }
        List<ImplementsInterface> implementsInterfaces = new ArrayList<>();
        getUniqueAncestorsInLevelOrder().stream()
                .map(generatedInterface -> ImplementsInterface.builder()
                        .interfaceClassName(generatedInterface.getClassName())
                        .addAllInterfaceProperties(
                                getEnrichedObjectProperties(generatedInterface, objectPropertyGetters))
                        .build())
                .forEach(implementsInterface -> {
                    extendedPropertyGetters.addAll(implementsInterface.interfaceProperties());
                    implementsInterfaces.add(implementsInterface);
                });
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
        TypeSpec objectTypeSpec = genericObjectGenerator.generate();
        JavaFile javaFile =
                JavaFile.builder(className.packageName(), objectTypeSpec).build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }

    /** Gets all ancestors under the interface implementation relation exactly once, in level order. */
    private List<GeneratedJavaInterface> getUniqueAncestorsInLevelOrder() {
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

    private static List<EnrichedObjectProperty> getEnrichedObjectProperties(
            GeneratedJavaInterface generatedJavaInterface,
            Map<ObjectProperty, EnrichedObjectProperty> objectPropertyGetters) {
        return generatedJavaInterface.propertyMethodSpecs().stream()
                .map(propertyMethodSpec -> {
                    EnrichedObjectProperty enrichedObjectProperty = EnrichedObjectProperty.of(
                            propertyMethodSpec.objectProperty(), true, propertyMethodSpec.methodSpec().returnType);
                    objectPropertyGetters.put(propertyMethodSpec.objectProperty(), enrichedObjectProperty);
                    return enrichedObjectProperty;
                })
                .collect(Collectors.toList());
    }

    // TODO(ajgateno): This is a hack!!!
    //  We can get rid of this once we've refactored these methods to give back objectPropertyGetters and
    //  extendedPropertyGetters idempotently without resetting.
    private void reset() {
        objectPropertyGetters = new HashMap<>();
        extendedPropertyGetters = new ArrayList<>();
    }
}
