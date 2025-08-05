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

package com.fern.java.generators;

import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.SafeAndUnsafeString;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.Literal;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.ir.model.types.PrimitiveTypeV1;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.UndiscriminatedUnionMember;
import com.fern.ir.model.types.UndiscriminatedUnionTypeDeclaration;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.ObjectMethodFactory;
import com.fern.java.ObjectMethodFactory.EqualsMethod;
import com.fern.java.PoetTypeNameMapper;
import com.fern.java.utils.InlineTypeIdResolver;
import com.fern.java.utils.NamedTypeId;
import com.fern.java.utils.TypeReferenceUtils;
import com.fern.java.utils.TypeReferenceUtils.ContainerTypeEnum;
import com.fern.java.utils.TypeReferenceUtils.TypeReferenceToName;
import com.google.common.collect.ImmutableSet;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.TypeVariableName;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class UndiscriminatedUnionGenerator extends AbstractTypeGenerator {
    private static final String VISITOR_CLASS_NAME = "Visitor";
    private static final String VISITOR_CLASS_NAME_UNDERSCORE = "Visitor_";

    private static final String TYPE_COMMENT = "If %d, value is of type %s";
    private static final String TYPE_FIELD_NAME = "type";
    private static final FieldSpec VALUE_FIELD_SPEC = FieldSpec.builder(Object.class, "value")
            .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
            .build();
    private static final String VISIT_METHOD_NAME = "visit";
    private static final TypeVariableName VISITOR_RETURN_TYPE = TypeVariableName.get("T");
    private static final String STATIC_FACTORY_METHOD_NAME = "of";

    private final UndiscriminatedUnionTypeDeclaration undiscriminatedUnion;
    private final Map<UndiscriminatedUnionMember, TypeName> memberTypeNames;
    private final List<UndiscriminatedUnionMember> membersWithoutLiterals;
    /**
     * The outer container types that are present in more than one member. For example, if we have two member types with
     * a container type of List, ContainerTypeEnum.LIST will be present here. These require special method naming to
     * deconflict due to Java's type erasure.
     */
    private final Set<ContainerTypeEnum> duplicatedOuterContainerTypes;

    private final ClassName visitorClassName;
    private final ClassName deserializerClassName;
    private final String undiscriminatedUnionPrefix;
    private final String visitorName;

    public UndiscriminatedUnionGenerator(
            ClassName className,
            AbstractGeneratorContext<?, ?> generatorContext,
            UndiscriminatedUnionTypeDeclaration undiscriminatedUnion,
            Set<String> reservedTypeNames,
            boolean isTopLevelClass,
            String undiscriminatedUnionPrefix) {
        super(className, generatorContext, reservedTypeNames, isTopLevelClass);
        this.undiscriminatedUnion = undiscriminatedUnion;

        Map<UndiscriminatedUnionMember, TypeName> typeNames = new HashMap<>(undiscriminatedUnion.getMembers().stream()
                .collect(Collectors.toMap(
                        Function.identity(),
                        member -> generatorContext.getPoetTypeNameMapper().convertToTypeName(true, member.getType()))));
        if (generatorContext.getCustomConfig().enableInlineTypes()) {
            typeNames.putAll(overrideMemberTypeNames(
                    className, generatorContext, undiscriminatedUnion, reservedTypeNames, undiscriminatedUnionPrefix));
        }
        this.memberTypeNames = typeNames;
        List<UndiscriminatedUnionMember> membersWithoutLiterals = new ArrayList<>();

        for (int i = 0; i < undiscriminatedUnion.getMembers().size(); ++i) {
            AtomicReference<UndiscriminatedUnionMember> member =
                    new AtomicReference<>(undiscriminatedUnion.getMembers().get(i));

            if (isLiteral(member.get())) {
                Literal literal =
                        member.get().getType().getContainer().get().getLiteral().get();
                boolean shouldInclude = literal.visit(new Literal.Visitor<Boolean>() {
                    @Override
                    public Boolean visitString(String s) {
                        if (!hasString()) {
                            member.set(UndiscriminatedUnionMember.builder()
                                    .from(member.get())
                                    .type(com.fern.ir.model.types.TypeReference.primitive(PrimitiveType.builder()
                                            .v1(PrimitiveTypeV1.STRING)
                                            .build()))
                                    .build());
                            memberTypeNames.put(member.get(), ClassName.get(String.class));
                            return true;
                        }
                        return false;
                    }

                    @Override
                    public Boolean visitBoolean(boolean b) {
                        if (!hasBoolean()) {
                            member.set(UndiscriminatedUnionMember.builder()
                                    .from(member.get())
                                    .type(com.fern.ir.model.types.TypeReference.primitive(PrimitiveType.builder()
                                            .v1(PrimitiveTypeV1.BOOLEAN)
                                            .build()))
                                    .build());
                            memberTypeNames.put(member.get(), ClassName.get(String.class));
                            return true;
                        }
                        return false;
                    }

                    @Override
                    public Boolean _visitUnknown(Object o) {
                        throw new RuntimeException("Got unknown literal type " + o);
                    }
                });
                if (!shouldInclude) {
                    continue;
                }
            }

            membersWithoutLiterals.add(member.get());
        }

        this.membersWithoutLiterals = membersWithoutLiterals;

        this.duplicatedOuterContainerTypes = getDuplicatedOuterContainerTypes(undiscriminatedUnion);
        this.visitorName = visitorName(
                // We need to take into consideration all ancestor types as well as all sibling types so that
                // to prevent naming the visitor "Visitor" if we already have a variant or property called that.
                ImmutableSet.<String>builder()
                        .addAll(reservedTypeNames)
                        .addAll(
                                generatorContext.getCustomConfig().enableInlineTypes()
                                        ? overriddenTypeDeclarations(
                                                        className,
                                                        generatorContext,
                                                        undiscriminatedUnion,
                                                        reservedTypeNames,
                                                        undiscriminatedUnionPrefix)
                                                .values()
                                                .stream()
                                                .map(TypeDeclaration::getName)
                                                .map(DeclaredTypeName::getName)
                                                .map(Name::getPascalCase)
                                                .map(SafeAndUnsafeString::getSafeName)
                                                .collect(Collectors.toList())
                                        : List.of())
                        .build());
        this.visitorClassName = className.nestedClass(visitorName);
        this.deserializerClassName = className.nestedClass("Deserializer");
        this.undiscriminatedUnionPrefix = undiscriminatedUnionPrefix;
    }

    public static Set<ContainerTypeEnum> getDuplicatedOuterContainerTypes(
            UndiscriminatedUnionTypeDeclaration undiscriminatedUnion) {
        return undiscriminatedUnion.getMembers().stream()
                .map(member -> TypeReferenceUtils.toContainerType(member.getType()))
                .flatMap(Optional::stream)
                .collect(Collectors.groupingBy(e -> e, Collectors.counting()))
                .entrySet()
                .stream()
                .filter(entry -> entry.getValue() > 1)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());
    }

    @Override
    public List<TypeDeclaration> getInlineTypeDeclarations() {
        return new ArrayList<>(overriddenTypeDeclarations(
                        className,
                        generatorContext,
                        undiscriminatedUnion,
                        reservedTypeNames,
                        undiscriminatedUnionPrefix)
                .values());
    }

    private boolean hasString() {
        return this.undiscriminatedUnion.getMembers().stream()
                .map(UndiscriminatedUnionMember::getType)
                .anyMatch(TypeReferenceUtils::isString);
    }

    private boolean hasBoolean() {
        return this.undiscriminatedUnion.getMembers().stream()
                .map(UndiscriminatedUnionMember::getType)
                .anyMatch(TypeReferenceUtils::isBoolean);
    }

    private Optional<CodeBlock> getStringLiteralJavadoc() {
        List<String> literalStringMembers = this.undiscriminatedUnion.getMembers().stream()
                .map(UndiscriminatedUnionMember::getType)
                .map(com.fern.ir.model.types.TypeReference::getContainer)
                .flatMap(Optional::stream)
                .map(ContainerType::getLiteral)
                .flatMap(Optional::stream)
                .map(Literal::getString)
                .flatMap(Optional::stream)
                .collect(Collectors.toList());

        if (literalStringMembers.isEmpty()) {
            return Optional.empty();
        }

        StringBuilder result = new StringBuilder("@param value must be one of the following:\n");
        result.append("<ul>\n");
        for (String _member : literalStringMembers) {
            result.append("<li>$S</li>\n");
        }
        result.append("</ul>");

        if (hasString()) {
            result.append("\nOr an arbitrary string.");
        }

        return Optional.of(CodeBlock.of(result.toString(), literalStringMembers.toArray()));
    }

    private static boolean isLiteral(UndiscriminatedUnionMember member) {
        return member.getType().getContainer().map(ContainerType::isLiteral).orElse(false);
    }

    private static Map<TypeId, TypeDeclaration> overriddenTypeDeclarations(
            ClassName className,
            AbstractGeneratorContext<?, ?> generatorContext,
            UndiscriminatedUnionTypeDeclaration undiscriminatedUnion,
            Set<String> reservedTypeNames,
            String undiscriminatedUnionPrefix) {
        Map<TypeId, TypeDeclaration> overriddenTypeDeclarations = new HashMap<>();

        for (UndiscriminatedUnionMember member : undiscriminatedUnion.getMembers()) {
            // We're not going to use the name we resolve here for anything os it's okay to pass an empty string
            List<NamedTypeId> resolvedIds = member.getType().visit(new InlineTypeIdResolver("", generatorContext));
            for (NamedTypeId resolvedId : resolvedIds) {
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

                Set<String> allReservedTypeNames = new HashSet<>(reservedTypeNames);

                String name =
                        rawTypeDeclaration.getName().getName().getPascalCase().getSafeName();

                // Omit the prefix from type names that start with it, for better style
                if (name.startsWith(undiscriminatedUnionPrefix) && !name.equals(undiscriminatedUnionPrefix)) {
                    name = name.substring(undiscriminatedUnionPrefix.length());
                }

                boolean valid;
                do {
                    valid = !allReservedTypeNames.contains(name);

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

    private static Map<UndiscriminatedUnionMember, TypeName> overrideMemberTypeNames(
            ClassName className,
            AbstractGeneratorContext<?, ?> generatorContext,
            UndiscriminatedUnionTypeDeclaration undiscriminatedUnion,
            Set<String> reservedTypeNames,
            String undiscriminatedUnionPrefix) {
        Map<TypeId, TypeDeclaration> overriddenDeclarations = overriddenTypeDeclarations(
                className, generatorContext, undiscriminatedUnion, reservedTypeNames, undiscriminatedUnionPrefix);
        Map<DeclaredTypeName, ClassName> mapperEnclosingClasses = new HashMap<>();

        for (TypeDeclaration override : overriddenDeclarations.values()) {
            mapperEnclosingClasses.put(override.getName(), className);
        }

        Map<TypeId, TypeDeclaration> typeDeclarationsWithOverrides =
                new HashMap<>(generatorContext.getTypeDeclarations());
        typeDeclarationsWithOverrides.putAll(overriddenDeclarations);

        Map<UndiscriminatedUnionMember, TypeName> result = new HashMap<>();

        PoetTypeNameMapper overriddenMapper = new PoetTypeNameMapper(
                generatorContext.getPoetClassNameFactory(),
                generatorContext.getCustomConfig(),
                typeDeclarationsWithOverrides,
                mapperEnclosingClasses);

        for (UndiscriminatedUnionMember member : undiscriminatedUnion.getMembers()) {
            TypeName typeName = overriddenMapper.convertToTypeName(true, member.getType());
            result.put(member, typeName);
        }

        return result;
    }

    @Override
    protected TypeSpec getTypeSpecWithoutInlineTypes() {
        EqualsMethod equalsMethod = generateEqualsMethod();

        TypeSpec.Builder unionTypeSpec = TypeSpec.classBuilder(className)
                .addAnnotation(AnnotationSpec.builder(JsonDeserialize.class)
                        .addMember("using", "$T.class", deserializerClassName)
                        .build())
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(VALUE_FIELD_SPEC)
                .addField(FieldSpec.builder(int.class, TYPE_FIELD_NAME)
                        .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .addParameter(Object.class, VALUE_FIELD_SPEC.name)
                        .addParameter(int.class, TYPE_FIELD_NAME)
                        .addStatement("this.$L = $L", VALUE_FIELD_SPEC.name, VALUE_FIELD_SPEC.name)
                        .addStatement("this.$L = $L", TYPE_FIELD_NAME, TYPE_FIELD_NAME)
                        .build())
                .addMethod(getRetriever())
                .addMethod(getVisitMethod())
                .addMethod(equalsMethod.getEqualsMethodSpec());
        equalsMethod.getEqualToMethodSpec().ifPresent(unionTypeSpec::addMethod);
        unionTypeSpec
                .addMethod(generateHashCode())
                .addMethod(generateToString())
                .addMethods(getStaticFactories())
                .addType(getVisitor())
                .addType(getDeserializer());
        return unionTypeSpec.build();
    }

    private MethodSpec getRetriever() {
        return MethodSpec.methodBuilder("get")
                .addAnnotation(JsonValue.class)
                .addModifiers(Modifier.PUBLIC)
                .addStatement("return this.$N", VALUE_FIELD_SPEC)
                .returns(VALUE_FIELD_SPEC.type)
                .build();
    }

    private MethodSpec getVisitMethod() {
        MethodSpec.Builder visitMethod = MethodSpec.methodBuilder(VISIT_METHOD_NAME)
                .addAnnotation(AnnotationSpec.builder(SuppressWarnings.class)
                        .addMember("value", "$S", "unchecked")
                        .build())
                .addModifiers(Modifier.PUBLIC)
                .addParameter(ParameterizedTypeName.get(visitorClassName, VISITOR_RETURN_TYPE), "visitor")
                .addTypeVariable(VISITOR_RETURN_TYPE)
                .returns(VISITOR_RETURN_TYPE);
        for (int i = 0; i < membersWithoutLiterals.size(); ++i) {
            UndiscriminatedUnionMember member = membersWithoutLiterals.get(i);

            if (i == 0) {
                visitMethod.beginControlFlow("if(this.$L == $L)", TYPE_FIELD_NAME, i);
            } else {
                visitMethod.nextControlFlow("else if(this.$L == $L)", TYPE_FIELD_NAME, i);
            }
            visitMethod.addStatement(
                    "return $L.$L(($T) this.$L)",
                    "visitor",
                    getDeConflictedMemberName(member, VISIT_METHOD_NAME),
                    memberTypeNames.get(member),
                    VALUE_FIELD_SPEC.name);
        }
        visitMethod.endControlFlow();
        visitMethod.addStatement(
                "throw new $T($S)", IllegalStateException.class, "Failed to visit value. This should never happen.");
        return visitMethod.build();
    }

    private EqualsMethod generateEqualsMethod() {
        return ObjectMethodFactory.createEqualsMethod(className, List.of(VALUE_FIELD_SPEC));
    }

    private MethodSpec generateHashCode() {
        return ObjectMethodFactory.createHashCodeMethod(List.of(VALUE_FIELD_SPEC))
                .get();
    }

    private MethodSpec generateToString() {
        return MethodSpec.methodBuilder("toString")
                .addAnnotation(ClassName.get("", "java.lang.Override"))
                .addModifiers(Modifier.PUBLIC)
                .returns(String.class)
                .addStatement("return this.$L.$L()", VALUE_FIELD_SPEC.name, "toString")
                .build();
    }

    private TypeSpec getVisitor() {
        List<MethodSpec> visitMethods = new ArrayList<>();

        for (int i = 0; i < membersWithoutLiterals.size(); ++i) {
            UndiscriminatedUnionMember member = membersWithoutLiterals.get(i);

            MethodSpec.Builder builder = MethodSpec.methodBuilder(getDeConflictedMemberName(member, VISIT_METHOD_NAME))
                    .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                    .returns(VISITOR_RETURN_TYPE)
                    .addParameter(memberTypeNames.get(member), VALUE_FIELD_SPEC.name);

            if (TypeReferenceUtils.isString(member.getType())) {
                getStringLiteralJavadoc().ifPresent(builder::addJavadoc);
            }

            visitMethods.add(builder.build());
        }

        return TypeSpec.interfaceBuilder(visitorClassName)
                .addModifiers(Modifier.PUBLIC)
                .addTypeVariable(VISITOR_RETURN_TYPE)
                .addMethods(visitMethods)
                .build();
    }

    private List<MethodSpec> getStaticFactories() {
        List<MethodSpec> staticFactories = new ArrayList<>();
        for (int i = 0; i < membersWithoutLiterals.size(); ++i) {
            UndiscriminatedUnionMember member = membersWithoutLiterals.get(i);

            MethodSpec.Builder builder = MethodSpec.methodBuilder(
                            getDeConflictedMemberName(member, STATIC_FACTORY_METHOD_NAME))
                    .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                    .addParameter(memberTypeNames.get(member), VALUE_FIELD_SPEC.name)
                    .addStatement("return new $T($L, $L)", className, VALUE_FIELD_SPEC.name, i)
                    .returns(className);

            if (TypeReferenceUtils.isString(member.getType())) {
                getStringLiteralJavadoc().ifPresent(builder::addJavadoc);
            }

            staticFactories.add(builder.build());
        }
        return staticFactories;
    }

    private String getDeConflictedMemberName(UndiscriminatedUnionMember member, String prefix) {
        Optional<ContainerTypeEnum> containerTypeEnum = TypeReferenceUtils.toContainerType(member.getType());
        if (containerTypeEnum.isEmpty() || !duplicatedOuterContainerTypes.contains(containerTypeEnum.get())) {
            return prefix;
        }
        return prefix + member.getType().visit(new TypeReferenceToName());
    }

    private TypeSpec getDeserializer() {
        TypeSpec.Builder deserializerBuilder = TypeSpec.classBuilder(deserializerClassName)
                .addModifiers(Modifier.STATIC, Modifier.FINAL)
                .superclass(ParameterizedTypeName.get(ClassName.get(StdDeserializer.class), className))
                .addMethod(MethodSpec.constructorBuilder()
                        .addStatement("super($T.class)", className)
                        .build());
        MethodSpec.Builder deserializeMethod = MethodSpec.methodBuilder("deserialize")
                .addModifiers(Modifier.PUBLIC)
                .returns(className)
                .addParameter(JsonParser.class, "p")
                .addParameter(DeserializationContext.class, "context")
                .addException(IOException.class)
                .addAnnotation(ClassName.get("", "java.lang.Override"))
                .addStatement(
                        "$T $L = $L.readValueAs($T.class)", Object.class, VALUE_FIELD_SPEC.name, "p", Object.class);
        for (int i = 0; i < membersWithoutLiterals.size(); ++i) {
            UndiscriminatedUnionMember member = membersWithoutLiterals.get(i);

            TypeName typeName = memberTypeNames.get(member);
            if (typeName.isPrimitive() || typeName.isBoxedPrimitive()) {
                deserializeMethod
                        .beginControlFlow("if ($L instanceof $T)", VALUE_FIELD_SPEC.name, typeName.box())
                        .addStatement(
                                "return $L(($T) $L)", STATIC_FACTORY_METHOD_NAME, typeName.box(), VALUE_FIELD_SPEC.name)
                        .endControlFlow();
            } else {
                if (shouldDeserializeWithTypeReference(member)) {
                    deserializeMethod
                            .beginControlFlow("try")
                            .addStatement(
                                    "return $L($T.$N.convertValue($L, new $T() {}))",
                                    getDeConflictedMemberName(member, STATIC_FACTORY_METHOD_NAME),
                                    generatorContext.getPoetClassNameFactory().getObjectMapperClassName(),
                                    ObjectMappersGenerator.JSON_MAPPER_STATIC_FIELD_NAME,
                                    VALUE_FIELD_SPEC.name,
                                    ParameterizedTypeName.get(ClassName.get(TypeReference.class), typeName))
                            .nextControlFlow("catch($T e)", RuntimeException.class)
                            .endControlFlow();
                } else {
                    deserializeMethod
                            .beginControlFlow("try")
                            .addStatement(
                                    "return $L($T.$N.convertValue($L, $T.class))",
                                    getDeConflictedMemberName(member, STATIC_FACTORY_METHOD_NAME),
                                    generatorContext.getPoetClassNameFactory().getObjectMapperClassName(),
                                    ObjectMappersGenerator.JSON_MAPPER_STATIC_FIELD_NAME,
                                    VALUE_FIELD_SPEC.name,
                                    typeName)
                            .nextControlFlow("catch($T e)", RuntimeException.class)
                            .endControlFlow();
                }
            }
        }
        deserializeMethod.addStatement("throw new $T(p, $S)", JsonParseException.class, "Failed to deserialize");
        return deserializerBuilder.addMethod(deserializeMethod.build()).build();
    }

    /**
     * Container types need to be deserialized with Type References so that information about type parameters gets
     * preserved. Otherwise, we run the risk of running into a ClassCastException when deserializing.
     * https://fasterxml.github.io/jackson-core/javadoc/2.2.0/com/fasterxml/jackson/core/type/TypeReference.html
     */
    private boolean shouldDeserializeWithTypeReference(UndiscriminatedUnionMember member) {
        if (member.getType().isContainer()) {
            return true;
        }
        if (!generatorContext.getCustomConfig().wrappedAliases()
                && member.getType().isNamed()) {
            TypeId typeId = member.getType().getNamed().get().getTypeId();
            TypeDeclaration typeDeclaration =
                    generatorContext.getTypeDeclarations().get(typeId);
            return typeDeclaration.getShape().isAlias()
                    && typeDeclaration
                            .getShape()
                            .getAlias()
                            .get()
                            .getResolvedType()
                            .isContainer();
        }
        return false;
    }

    private static String visitorName(Set<String> reservedTypeNames) {
        return reservedTypeNames.contains(VISITOR_CLASS_NAME) ? VISITOR_CLASS_NAME_UNDERSCORE : VISITOR_CLASS_NAME;
    }
}
