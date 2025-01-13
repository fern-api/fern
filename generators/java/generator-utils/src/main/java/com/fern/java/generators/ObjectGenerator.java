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

import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.SafeAndUnsafeString;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.PoetTypeNameMapper;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.generators.object.ImplementsInterface;
import com.fern.java.generators.object.ObjectTypeSpecGenerator;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObject;
import com.fern.java.utils.NamedTypeId;
import com.fern.java.utils.TypeIdResolver;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.TypeName;
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

public final class ObjectGenerator extends AbstractTypeGenerator {
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
        objectPropertyGetters = new HashMap<>();
        extendedPropertyGetters = new ArrayList<>();
        JavaFile javaFile =
                JavaFile.builder(className.packageName(), getTypeSpec()).build();
        return GeneratedObject.builder()
                .className(className)
                .javaFile(javaFile)
                .putAllObjectPropertyGetters(objectPropertyGetters)
                .addAllExtendedObjectPropertyGetters(extendedPropertyGetters)
                .build();
    }

    public TypeSpec getTypeSpec() {
        objectPropertyGetters = new HashMap<>();
        extendedPropertyGetters = new ArrayList<>();
        PoetTypeNameMapper poetTypeNameMapper = generatorContext.getPoetTypeNameMapper();
        List<EnrichedObjectProperty> enrichedObjectProperties = new ArrayList<>();
        if (selfInterface.isEmpty()) {
            enrichedObjectProperties = objectTypeDeclaration.getProperties().stream()
                    .map(objectProperty -> {
                        EnrichedObjectProperty enrichedObjectProperty = EnrichedObjectProperty.of(
                                objectProperty,
                                false,
                                poetTypeNameMapper.convertToTypeName(true, objectProperty.getValueType()));
                        objectPropertyGetters.put(objectProperty, enrichedObjectProperty);
                        return enrichedObjectProperty;
                    })
                    .collect(Collectors.toList());
        }
        List<ImplementsInterface> implementsInterfaces = new ArrayList<>();
        Set<GeneratedJavaInterface> visited = new HashSet<>();
        extendedInterfaces.stream()
                .map(generatedInterface -> {
                    List<EnrichedObjectProperty> enrichedProperties = new ArrayList<>();
                    Queue<GeneratedJavaInterface> interfaceQueue = new LinkedList<>();
                    interfaceQueue.add(generatedInterface);
                    while (!interfaceQueue.isEmpty()) {
                        GeneratedJavaInterface generatedJavaInterface = interfaceQueue.poll();
                        if (visited.contains(generatedJavaInterface)) {
                            continue;
                        }
                        interfaceQueue.addAll(generatedJavaInterface.extendedInterfaces().stream()
                                .map(DeclaredTypeName::getTypeId)
                                .map(allGeneratedInterfaces::get)
                                .collect(Collectors.toList()));
                        enrichedProperties.addAll(
                                getEnrichedObjectProperties(generatedJavaInterface, objectPropertyGetters));
                        visited.add(generatedJavaInterface);
                    }
                    return ImplementsInterface.builder()
                            .interfaceClassName(generatedInterface.getClassName())
                            .addAllInterfaceProperties(enrichedProperties)
                            .build();
                })
                .forEach(implementsInterface -> {
                    extendedPropertyGetters.addAll(implementsInterface.interfaceProperties());
                    implementsInterfaces.add(implementsInterface);
                });
        ObjectTypeSpecGenerator genericObjectGenerator = new ObjectTypeSpecGenerator(
                className,
                generatorContext.getPoetClassNameFactory().getObjectMapperClassName(),
                enrichedObjectProperties.stream().map(this::withPropertyName).collect(Collectors.toList()),
                implementsInterfaces.stream().map(this::overridePropertyNames).collect(Collectors.toList()),
                true,
                generatorContext.getCustomConfig().enablePublicConstructors(),
                generatorContext.deserializeWithAdditionalProperties(),
                generatorContext.getCustomConfig().jsonInclude(),
                generatorContext.getCustomConfig().disableRequiredPropertyBuilderChecks(),
                generatorContext.builderNotNullChecks());
        return genericObjectGenerator.generate();
    }

    @Override
    public Map<String, TypeId> getTypeIdsByPropertyName() {
        return Map.of();
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

    public Map<ObjectProperty, EnrichedObjectProperty> objectPropertyGetters() {
        return objectPropertyGetters;
    }

    private ImplementsInterface overridePropertyNames(ImplementsInterface implementsInterface) {
        return ImplementsInterface.builder()
                .interfaceClassName(implementsInterface.interfaceClassName())
                .addAllInterfaceProperties(implementsInterface.interfaceProperties().stream()
                        .map(this::withPropertyName)
                        .collect(Collectors.toList()))
                .build();
    }

    /**
     * If the incoming enriched property is inlined, override the property type name to be the enriched property name.
     */
    private EnrichedObjectProperty withPropertyName(EnrichedObjectProperty enrichedObjectProperty) {
        Optional<ObjectProperty> maybeObjectProperty = asObjectProperty(enrichedObjectProperty);

        if (maybeObjectProperty.isEmpty()) {
            // We don't have this enriched property in our getters; nothing to do.
            return enrichedObjectProperty;
        }

        ObjectProperty objectProperty = maybeObjectProperty.get();

        List<NamedTypeId> namedTypeIds = objectProperty
                .getValueType()
                .visit(new TypeIdResolver(enrichedObjectProperty.pascalCaseKey(), objectProperty.getValueType()));

        Map<TypeId, TypeDeclaration> overriddenTypeDeclarations = new HashMap<>(generatorContext.getTypeDeclarations());
        Map<DeclaredTypeName, ClassName> enclosingClassMapping = new HashMap<>();

        for (NamedTypeId namedId : namedTypeIds) {
            Optional<TypeDeclaration> maybeOriginalTypeDeclaration =
                    Optional.ofNullable(generatorContext.getTypeDeclarations().get(namedId.typeId()));

            if (maybeOriginalTypeDeclaration.isEmpty()) {
                // If even one of the corresponding type declarations is not present, there's nothing we can do.
                return enrichedObjectProperty;
            }

            TypeDeclaration originalTypeDeclaration = maybeOriginalTypeDeclaration.get();

            if (!originalTypeDeclaration.getInline().orElse(false)) {
                // Don't do anything do non-inline declarations.
                continue;
            }

            TypeDeclaration overriddenTypeDeclaration = TypeDeclaration.builder()
                    .name(DeclaredTypeName.builder()
                            .typeId(namedId.typeId())
                            // This doesn't matter because all the ones we're going to use from here are inlined.
                            .fernFilepath(originalTypeDeclaration.getName().getFernFilepath())
                            .name(Name.builder()
                                    .originalName(namedId.name())
                                    .camelCase(SafeAndUnsafeString.builder()
                                            .unsafeName(namedId.name())
                                            .safeName(namedId.name())
                                            .build())
                                    .pascalCase(SafeAndUnsafeString.builder()
                                            .unsafeName(namedId.name())
                                            .safeName(namedId.name())
                                            .build())
                                    .snakeCase(SafeAndUnsafeString.builder()
                                            .unsafeName(namedId.name())
                                            .safeName(namedId.name())
                                            .build())
                                    .screamingSnakeCase(SafeAndUnsafeString.builder()
                                            .unsafeName(namedId.name())
                                            .safeName(namedId.name())
                                            .build())
                                    .build())
                            .build())
                    .shape(originalTypeDeclaration.getShape())
                    .build();
            enclosingClassMapping.put(overriddenTypeDeclaration.getName(), className);

            overriddenTypeDeclarations.put(namedId.typeId(), overriddenTypeDeclaration);
        }

        PoetTypeNameMapper overriddenTypeNameMapper = new PoetTypeNameMapper(
                generatorContext.getPoetClassNameFactory(),
                generatorContext.getCustomConfig(),
                overriddenTypeDeclarations,
                enclosingClassMapping);

        TypeName poetTypeName = overriddenTypeNameMapper.convertToTypeName(false, objectProperty.getValueType());

        return EnrichedObjectProperty.builder()
                .camelCaseKey(enrichedObjectProperty.camelCaseKey())
                .pascalCaseKey(enrichedObjectProperty.pascalCaseKey())
                .poetTypeName(poetTypeName)
                .fromInterface(enrichedObjectProperty.fromInterface())
                .wireKey(enrichedObjectProperty.wireKey())
                .docs(enrichedObjectProperty.docs())
                .literal(enrichedObjectProperty.literal())
                .build();
    }

    /** Attempt to get the ObjectProperty that the given EnrichedObjectProperty was generated from. */
    private Optional<ObjectProperty> asObjectProperty(EnrichedObjectProperty enrichedObjectProperty) {
        for (Map.Entry<ObjectProperty, EnrichedObjectProperty> entry : objectPropertyGetters.entrySet()) {
            if (entry.getValue().equals(enrichedObjectProperty)) {
                return Optional.of(entry.getKey());
            }
        }
        return Optional.empty();
    }
}
