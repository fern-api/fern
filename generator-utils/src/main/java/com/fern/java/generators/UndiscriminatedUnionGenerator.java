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
import com.fern.ir.v12.model.types.UndiscriminatedUnionMember;
import com.fern.ir.v12.model.types.UndiscriminatedUnionTypeDeclaration;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.ObjectMethodFactory;
import com.fern.java.ObjectMethodFactory.EqualsMethod;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.TypeVariableName;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class UndiscriminatedUnionGenerator extends AbstractFileGenerator {

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
    private final ClassName visitorClassName;
    private final ClassName deserializerClassName;

    public UndiscriminatedUnionGenerator(
            ClassName className,
            AbstractGeneratorContext<?> generatorContext,
            UndiscriminatedUnionTypeDeclaration undiscriminatedUnion) {
        super(className, generatorContext);
        this.undiscriminatedUnion = undiscriminatedUnion;
        this.memberTypeNames = undiscriminatedUnion.getMembers().stream()
                .collect(Collectors.toMap(
                        Function.identity(),
                        member -> generatorContext.getPoetTypeNameMapper().convertToTypeName(true, member.getType())));
        this.visitorClassName = className.nestedClass("Visitor");
        this.deserializerClassName = className.nestedClass("Deserializer");
    }

    @Override
    public GeneratedJavaFile generateFile() {
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
        JavaFile javaFile =
                JavaFile.builder(className.packageName(), unionTypeSpec.build()).build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
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
                .addModifiers(Modifier.PUBLIC)
                .addParameter(ParameterizedTypeName.get(visitorClassName, VISITOR_RETURN_TYPE), "visitor")
                .addTypeVariable(VISITOR_RETURN_TYPE)
                .returns(VISITOR_RETURN_TYPE);
        for (int i = 0; i < undiscriminatedUnion.getMembers().size(); ++i) {
            UndiscriminatedUnionMember member =
                    undiscriminatedUnion.getMembers().get(i);
            if (i == 0) {
                visitMethod.beginControlFlow("if(this.$L == $L)", TYPE_FIELD_NAME, i);
            } else {
                visitMethod.nextControlFlow("else if(this.$L == $L)", TYPE_FIELD_NAME, i);
            }
            visitMethod.addStatement(
                    "return $L.$L(($T) this.$L)",
                    "visitor",
                    VISIT_METHOD_NAME,
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
        return ObjectMethodFactory.createHashCodeMethod(List.of(VALUE_FIELD_SPEC), false)
                .get();
    }

    private MethodSpec generateToString() {
        return MethodSpec.methodBuilder("toString")
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(String.class)
                .addStatement("return this.$L.$L()", VALUE_FIELD_SPEC.name, "toString")
                .build();
    }

    private TypeSpec getVisitor() {
        List<MethodSpec> visitMethods = undiscriminatedUnion.getMembers().stream()
                .map(member -> MethodSpec.methodBuilder(VISIT_METHOD_NAME)
                        .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                        .returns(VISITOR_RETURN_TYPE)
                        .addParameter(memberTypeNames.get(member), VALUE_FIELD_SPEC.name)
                        .build())
                .collect(Collectors.toList());
        return TypeSpec.interfaceBuilder(visitorClassName)
                .addModifiers(Modifier.PUBLIC)
                .addTypeVariable(VISITOR_RETURN_TYPE)
                .addMethods(visitMethods)
                .build();
    }

    private List<MethodSpec> getStaticFactories() {
        List<MethodSpec> staticFactories = new ArrayList<>();
        for (int i = 0; i < undiscriminatedUnion.getMembers().size(); ++i) {
            UndiscriminatedUnionMember member =
                    undiscriminatedUnion.getMembers().get(i);
            staticFactories.add(MethodSpec.methodBuilder(STATIC_FACTORY_METHOD_NAME)
                    .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                    .addParameter(memberTypeNames.get(member), VALUE_FIELD_SPEC.name)
                    .addStatement("return new $T($L, $L)", className, VALUE_FIELD_SPEC.name, i)
                    .returns(className)
                    .build());
        }
        return staticFactories;
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
                .addParameter(DeserializationContext.class, "ctxt")
                .addException(IOException.class)
                .addAnnotation(Override.class)
                .addStatement(
                        "$T $L = $L.readValueAs($T.class)", Object.class, VALUE_FIELD_SPEC.name, "p", Object.class);
        for (int i = 0; i < undiscriminatedUnion.getMembers().size(); ++i) {
            UndiscriminatedUnionMember member =
                    undiscriminatedUnion.getMembers().get(i);
            TypeName typeName = memberTypeNames.get(member);
            if (typeName.isPrimitive() || typeName.isBoxedPrimitive()) {
                deserializeMethod
                        .beginControlFlow("if ($L instanceof $T)", VALUE_FIELD_SPEC.name, typeName.box())
                        .addStatement(
                                "return $L(($T) $L)", STATIC_FACTORY_METHOD_NAME, typeName.box(), VALUE_FIELD_SPEC.name)
                        .endControlFlow();
            } else {
                if (member.getType().isContainer()) {
                    deserializeMethod
                            .beginControlFlow("try")
                            .addStatement(
                                    "return $L($T.$N.convertValue($L, new $T() {}))",
                                    STATIC_FACTORY_METHOD_NAME,
                                    generatorContext.getPoetClassNameFactory().getObjectMapperClassName(),
                                    ObjectMappersGenerator.JSON_MAPPER_STATIC_FIELD_NAME,
                                    VALUE_FIELD_SPEC.name,
                                    ParameterizedTypeName.get(ClassName.get(TypeReference.class), typeName))
                            .nextControlFlow("catch($T e)", IllegalArgumentException.class)
                            .endControlFlow();
                } else {
                    deserializeMethod
                            .beginControlFlow("try")
                            .addStatement(
                                    "return $L($T.$N.convertValue($L, $T.class))",
                                    STATIC_FACTORY_METHOD_NAME,
                                    generatorContext.getPoetClassNameFactory().getObjectMapperClassName(),
                                    ObjectMappersGenerator.JSON_MAPPER_STATIC_FIELD_NAME,
                                    VALUE_FIELD_SPEC.name,
                                    typeName)
                            .nextControlFlow("catch($T e)", IllegalArgumentException.class)
                            .endControlFlow();
                }
            }
        }
        deserializeMethod.addStatement("throw new $T(p, $S)", JsonParseException.class, "Failed to deserialize");
        return deserializerBuilder.addMethod(deserializeMethod.build()).build();
    }
}
