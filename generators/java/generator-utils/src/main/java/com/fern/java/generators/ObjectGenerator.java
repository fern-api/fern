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
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.NamedType;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.PoetTypeNameMapper;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.generators.object.ImplementsInterface;
import com.fern.java.generators.object.ObjectTypeSpecGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObject;
import com.fern.java.utils.InlineTypeIdResolver;
import com.fern.java.utils.NamedTypeId;
import com.fern.java.utils.TypeReferenceInlineChecker;
import com.fern.java.utils.TypeReferenceUtils;
import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableMap;
import com.palantir.common.streams.KeyedStream;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
            Set<String> reservedTypeNames,
            boolean isTopLevelClass,
            List<ObjectProperty> fileProperties,
            List<ObjectProperty> allowMultipleProperties) {
        super(className, generatorContext, reservedTypeNames, isTopLevelClass);

        List<GeneratedJavaInterface> allExtendedInterfaces = new ArrayList<>();
        selfInterface.ifPresent(allExtendedInterfaces::add);
        allExtendedInterfaces.addAll(extendedInterfaces);

        List<GeneratedJavaInterface> ancestors =
                getUniqueAncestorsInLevelOrder(allExtendedInterfaces, allGeneratedInterfaces);

        List<EnrichedObjectProperty> enriched = enrichedObjectProperties(
                generatorContext,
                selfInterface,
                objectTypeDeclaration,
                generatorContext.getPoetTypeNameMapper(),
                fileProperties,
                allowMultipleProperties);
        List<ImplementsInterface> implemented = implementsInterfaces(generatorContext, ancestors);

        if (generatorContext.getCustomConfig().enableInlineTypes()) {
            List<EnrichedObjectProperty> allEnrichedProperties = new ArrayList<>();
            allEnrichedProperties.addAll(enriched);
            allEnrichedProperties.addAll(implemented.stream()
                    .map(ImplementsInterface::interfaceProperties)
                    .flatMap(List::stream)
                    .collect(Collectors.toList()));
            Map<EnrichedObjectProperty, EnrichedObjectProperty> propertyOverrides = overridePropertyTypes(
                    className,
                    generatorContext,
                    allEnrichedProperties,
                    overriddenTypeDeclarations(generatorContext, reservedTypeNames, allEnrichedProperties));
            this.enrichedObjectProperties = enriched.stream()
                    .map(prop -> applyOverrideIfNecessary(prop, propertyOverrides))
                    .collect(Collectors.toList());
            this.implementsInterfaces = implemented.stream()
                    .map(implementsInterface ->
                            applyPropertyOverridesIfNecessary(implementsInterface, propertyOverrides))
                    .collect(Collectors.toList());
        } else {
            this.enrichedObjectProperties = enriched;
            this.implementsInterfaces = implemented;
        }

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
    }

    @Override
    public List<TypeDeclaration> getInlineTypeDeclarations() {
        return new ArrayList<>(overriddenTypeDeclarations(
                        generatorContext, reservedTypeNames, new ArrayList<>(objectPropertyGetters.values()))
                .values());
    }

    @Override
    protected TypeSpec getTypeSpecWithoutInlineTypes() {
        ObjectTypeSpecGenerator genericObjectGenerator = new ObjectTypeSpecGenerator(
                className,
                generatorContext.getPoetClassNameFactory().getObjectMapperClassName(),
                generatorContext.getPoetClassNameFactory().getNullableClassName(),
                enrichedObjectProperties,
                implementsInterfaces,
                true,
                generatorContext.getCustomConfig().enablePublicConstructors(),
                generatorContext.deserializeWithAdditionalProperties(),
                generatorContext.getCustomConfig().jsonInclude(),
                generatorContext.getCustomConfig().disableRequiredPropertyBuilderChecks(),
                generatorContext.builderNotNullChecks());
        return genericObjectGenerator.generate();
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

    private static EnrichedObjectProperty applyOverrideIfNecessary(
            EnrichedObjectProperty raw, Map<EnrichedObjectProperty, EnrichedObjectProperty> overrides) {
        return Optional.ofNullable(overrides.get(raw)).orElse(raw);
    }

    private static ImplementsInterface applyPropertyOverridesIfNecessary(
            ImplementsInterface raw, Map<EnrichedObjectProperty, EnrichedObjectProperty> overrides) {
        return ImplementsInterface.builder()
                .interfaceClassName(raw.interfaceClassName())
                .addAllInterfaceProperties(raw.interfaceProperties().stream()
                        .map(prop -> applyOverrideIfNecessary(prop, overrides))
                        .collect(Collectors.toList()))
                .build();
    }

    private static Map<TypeId, TypeDeclaration> overriddenTypeDeclarations(
            AbstractGeneratorContext<?, ?> generatorContext,
            Set<String> reservedTypeNames,
            List<EnrichedObjectProperty> enrichedObjectProperties) {
        Set<String> allReservedTypeNames = new HashSet<>(reservedTypeNames);
        Map<TypeId, TypeDeclaration> overriddenTypeDeclarations = new HashMap<>();
        Set<String> propertyNames = new HashSet<>();

        for (EnrichedObjectProperty prop : enrichedObjectProperties) {
            propertyNames.add(prop.pascalCaseKey());
        }

        for (EnrichedObjectProperty prop : enrichedObjectProperties) {
            List<NamedTypeId> resolvedIds = prop.objectProperty()
                    .getValueType()
                    .visit(new InlineTypeIdResolver(prop.pascalCaseKey(), generatorContext));

            // See if the names require further resolution
            for (NamedTypeId resolvedId : resolvedIds) {
                String name = resolvedId.name();
                Optional<TypeDeclaration> maybeRawTypeDeclaration = Optional.ofNullable(
                        generatorContext.getTypeDeclarations().get(resolvedId.typeId()));

                if (maybeRawTypeDeclaration.isEmpty()) {
                    continue;
                }

                TypeDeclaration rawTypeDeclaration = maybeRawTypeDeclaration.get();

                // Don't override non-inline types
                if (!rawTypeDeclaration.getInline().orElse(false)) {
                    continue;
                }

                boolean valid;
                do {
                    // Prevent something like "Bar_" generated from resolution on a property name called "bar"
                    // colliding with "Bar_" generated from a property name called "bar_"
                    boolean newNameCollides = propertyNames.contains(name) && !name.equals(prop.pascalCaseKey());
                    valid = !allReservedTypeNames.contains(name) && !newNameCollides;

                    if (!valid) {
                        name += "_";
                    }
                } while (!valid);

                allReservedTypeNames.add(name);
                TypeDeclaration overriddenTypeDeclaration = overrideTypeDeclarationName(rawTypeDeclaration, name);
                overriddenTypeDeclarations.put(resolvedId.typeId(), overriddenTypeDeclaration);
            }
        }

        return overriddenTypeDeclarations;
    }

    private static Map<EnrichedObjectProperty, EnrichedObjectProperty> overridePropertyTypes(
            ClassName className,
            AbstractGeneratorContext<?, ?> generatorContext,
            List<EnrichedObjectProperty> enrichedObjectProperties,
            Map<TypeId, TypeDeclaration> overriddenTypeDeclarations) {
        Map<EnrichedObjectProperty, EnrichedObjectProperty> result = new HashMap<>();
        Map<DeclaredTypeName, ClassName> enclosingMappings = new HashMap<>();

        for (Map.Entry<TypeId, TypeDeclaration> entry : overriddenTypeDeclarations.entrySet()) {
            enclosingMappings.put(entry.getValue().getName(), className);
        }

        Map<TypeId, TypeDeclaration> typeDeclarationsWithOverrides =
                new HashMap<>(generatorContext.getTypeDeclarations());
        typeDeclarationsWithOverrides.putAll(overriddenTypeDeclarations);

        PoetTypeNameMapper overriddenMapper = new PoetTypeNameMapper(
                generatorContext.getPoetClassNameFactory(),
                generatorContext.getCustomConfig(),
                typeDeclarationsWithOverrides,
                enclosingMappings);

        for (EnrichedObjectProperty prop : enrichedObjectProperties) {
            TypeName typeName = overriddenMapper.convertToTypeName(
                    true, prop.objectProperty().getValueType());

            if (prop.allowMultiple()) {
                boolean isCollection = prop.objectProperty()
                        .getValueType()
                        .visit(new TypeReferenceUtils.IsCollectionType(generatorContext));

                if (!isCollection) {
                    // optional<T> with allow-multiple should become optional<list<T>>
                    if (prop.objectProperty().getValueType().isContainer()) {
                        ContainerType container = prop.objectProperty()
                                .getValueType()
                                .getContainer()
                                .get();
                        if (container.isOptional() || container.isNullable()) {
                            Preconditions.checkState(
                                    typeName instanceof ParameterizedTypeName,
                                    "Found optional/nullable with non-parameterized type name "
                                            + prop.objectProperty()
                                                    .getName()
                                                    .getName()
                                                    .getOriginalName());
                            TypeName parameterType =
                                    Objects.requireNonNull(((ParameterizedTypeName) typeName).typeArguments.get(0));
                            typeName = ParameterizedTypeName.get(
                                    ClassName.get(Optional.class),
                                    ParameterizedTypeName.get(ClassName.get(List.class), parameterType));
                        }
                    } else {
                        // T with allow-multiple should become list<T>
                        typeName = ParameterizedTypeName.get(ClassName.get(List.class), typeName);
                    }
                }
            }

            EnrichedObjectProperty overridden = EnrichedObjectProperty.builder()
                    .camelCaseKey(prop.camelCaseKey())
                    .pascalCaseKey(prop.pascalCaseKey())
                    .poetTypeName(typeName)
                    .fromInterface(prop.fromInterface())
                    .inline(true)
                    .wrappedAliases(prop.wrappedAliases())
                    .objectProperty(prop.objectProperty())
                    .nullableNonemptyFilterClassName(prop.nullableNonemptyFilterClassName())
                    .generator(prop.generator())
                    .allowMultiple(prop.allowMultiple())
                    .useNullableAnnotation(prop.useNullableAnnotation())
                    .wireKey(prop.wireKey())
                    .docs(prop.docs())
                    .literal(prop.literal())
                    .typeDeclaration(prop.typeDeclaration())
                    .build();
            result.put(prop, overridden);
        }

        return result;
    }

    private static List<ImplementsInterface> implementsInterfaces(
            AbstractGeneratorContext<?, ?> generatorContext, List<GeneratedJavaInterface> ancestors) {
        return ancestors.stream()
                .map(generatedInterface -> ImplementsInterface.builder()
                        .interfaceClassName(generatedInterface.getClassName())
                        .addAllInterfaceProperties(getEnrichedObjectProperties(generatorContext, generatedInterface))
                        .build())
                .collect(Collectors.toList());
    }

    private static List<EnrichedObjectProperty> enrichedObjectProperties(
            AbstractGeneratorContext<?, ?> generatorContext,
            Optional<GeneratedJavaInterface> selfInterface,
            ObjectTypeDeclaration objectTypeDeclaration,
            PoetTypeNameMapper poetTypeNameMapper,
            List<ObjectProperty> fileProperties,
            List<ObjectProperty> allowMultipleProperties) {
        List<EnrichedObjectProperty> result = new ArrayList<>();
        // NOTE: We don't support file as a type in the IR, and we require type declarations to
        //  use the poet type name mapper in the object generator. This implementation lets us
        //  tell the object generator whether this is a File, File array, or Optional File (array),
        //  and if we add files as types in the IR, we can just remove this and handle it as a regular
        //  property type.
        result.addAll(fileProperties.stream()
                .map(prop -> {
                    boolean isOptional = prop.getValueType().isContainer()
                            && prop.getValueType().getContainer().get().isOptional();
                    return EnrichedObjectProperty.of(
                            prop,
                            generatorContext.getType(),
                            Optional.empty(),
                            generatorContext.getPoetClassNameFactory().getNullableNonemptyFilterClassName(),
                            false,
                            false,
                            generatorContext.getCustomConfig().wrappedAliases(),
                            isOptional
                                    ? ParameterizedTypeName.get(
                                            ClassName.get(Optional.class), ClassName.get(File.class))
                                    : ClassName.get(File.class),
                            false,
                            generatorContext.getCustomConfig().useNullableAnnotation());
                })
                .collect(Collectors.toList()));
        result.addAll(allowMultipleProperties.stream()
                .map(prop -> {
                    TypeName poetTypeName = poetTypeNameMapper.convertToTypeName(false, prop.getValueType());

                    boolean isCollection =
                            prop.getValueType().visit(new TypeReferenceUtils.IsCollectionType(generatorContext));

                    if (!isCollection) {
                        // optional<T> with allow-multiple should become optional<list<T>>
                        if (prop.getValueType().isContainer()) {
                            ContainerType container =
                                    prop.getValueType().getContainer().get();
                            if (container.isOptional() || container.isNullable()) {
                                Preconditions.checkState(
                                        poetTypeName instanceof ParameterizedTypeName,
                                        "Found optional/nullable with non-parameterized type name "
                                                + prop.getName().getName().getOriginalName());
                                TypeName parameterType = Objects.requireNonNull(
                                        ((ParameterizedTypeName) poetTypeName).typeArguments.get(0));
                                poetTypeName = ParameterizedTypeName.get(
                                        ClassName.get(Optional.class),
                                        ParameterizedTypeName.get(ClassName.get(List.class), parameterType));
                            }
                        } else {
                            // T with allow-multiple should become list<T>
                            poetTypeName = ParameterizedTypeName.get(ClassName.get(List.class), poetTypeName);
                        }
                    }

                    return EnrichedObjectProperty.of(
                            prop,
                            generatorContext.getType(),
                            Optional.empty(),
                            generatorContext.getPoetClassNameFactory().getNullableNonemptyFilterClassName(),
                            false,
                            false,
                            generatorContext.getCustomConfig().wrappedAliases(),
                            poetTypeName,
                            !isCollection,
                            generatorContext.getCustomConfig().useNullableAnnotation());
                })
                .collect(Collectors.toList()));
        if (selfInterface.isEmpty()) {
            result.addAll(objectTypeDeclaration.getProperties().stream()
                    .map(objectProperty -> {
                        boolean inline =
                                objectProperty.getValueType().visit(new TypeReferenceInlineChecker(generatorContext));
                        return EnrichedObjectProperty.of(
                                objectProperty,
                                generatorContext.getType(),
                                objectProperty
                                        .getValueType()
                                        .getNamed()
                                        .map(NamedType::getTypeId)
                                        .map(generatorContext::getTypeDeclaration),
                                generatorContext.getPoetClassNameFactory().getNullableNonemptyFilterClassName(),
                                false,
                                inline,
                                generatorContext.getCustomConfig().wrappedAliases(),
                                poetTypeNameMapper.convertToTypeName(true, objectProperty.getValueType()),
                                false,
                                generatorContext.getCustomConfig().useNullableAnnotation());
                    })
                    .collect(Collectors.toList()));
        }
        return result;
    }

    private static List<EnrichedObjectProperty> getEnrichedObjectProperties(
            AbstractGeneratorContext<?, ?> generatorContext, GeneratedJavaInterface generatedJavaInterface) {
        return generatedJavaInterface.propertyMethodSpecs().stream()
                .map(propertyMethodSpec -> {
                    boolean inline = propertyMethodSpec
                            .objectProperty()
                            .getValueType()
                            .visit(new TypeReferenceInlineChecker(generatorContext));
                    return EnrichedObjectProperty.of(
                            propertyMethodSpec.objectProperty(),
                            generatorContext.getType(),
                            propertyMethodSpec
                                    .objectProperty()
                                    .getValueType()
                                    .getNamed()
                                    .map(NamedType::getTypeId)
                                    .map(generatorContext::getTypeDeclaration),
                            generatorContext.getPoetClassNameFactory().getNullableNonemptyFilterClassName(),
                            true,
                            inline,
                            generatorContext.getCustomConfig().wrappedAliases(),
                            propertyMethodSpec.methodSpec().returnType,
                            false,
                            generatorContext.getCustomConfig().useNullableAnnotation());
                })
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
