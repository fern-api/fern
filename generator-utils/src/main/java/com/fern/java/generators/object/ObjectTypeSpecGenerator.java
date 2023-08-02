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

package com.fern.java.generators.object;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.java.ObjectMethodFactory;
import com.fern.java.ObjectMethodFactory.EqualsMethod;
import com.fern.java.PoetTypeWithClassName;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class ObjectTypeSpecGenerator {
    private final ClassName objectClassName;
    private final List<EnrichedObjectProperty> allEnrichedProperties = new ArrayList<>();
    private final List<ImplementsInterface> interfaces;
    private final boolean isSerialized;
    private final boolean publicConstructorsEnabled;

    public ObjectTypeSpecGenerator(
            ClassName objectClassName,
            List<EnrichedObjectProperty> enrichedObjectProperties,
            List<ImplementsInterface> interfaces,
            boolean isSerialized,
            boolean publicConstructorsEnabled) {
        this.objectClassName = objectClassName;
        this.interfaces = interfaces;
        for (ImplementsInterface implementsInterface : interfaces) {
            allEnrichedProperties.addAll(implementsInterface.interfaceProperties());
        }
        allEnrichedProperties.addAll(enrichedObjectProperties);
        this.isSerialized = isSerialized;
        this.publicConstructorsEnabled = publicConstructorsEnabled;
    }

    public TypeSpec generate() {
        EqualsMethod equalsMethod = generateEqualsMethod();
        Optional<ObjectBuilder> maybeObjectBuilder = generateBuilder();
        TypeSpec.Builder typeSpecBuilder = TypeSpec.classBuilder(objectClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addFields(allEnrichedProperties.stream()
                        .map(EnrichedObjectProperty::fieldSpec)
                        .flatMap(Optional::stream)
                        .collect(Collectors.toList()))
                .addSuperinterfaces(interfaces.stream()
                        .map(ImplementsInterface::interfaceClassName)
                        .collect(Collectors.toList()))
                .addMethod(generateConstructor())
                .addMethods(allEnrichedProperties.stream()
                        .map(EnrichedObjectProperty::getterProperty)
                        .collect(Collectors.toList()))
                .addMethod(equalsMethod.getEqualsMethodSpec());
        equalsMethod.getEqualToMethodSpec().ifPresent(typeSpecBuilder::addMethod);
        generateHashCode().ifPresent(typeSpecBuilder::addMethod);
        typeSpecBuilder.addMethod(generateToString());
        if (maybeObjectBuilder.isPresent()) {
            ObjectBuilder objectBuilder = maybeObjectBuilder.get();
            typeSpecBuilder.addMethod(objectBuilder.getBuilderStaticMethod());
            typeSpecBuilder.addTypes(objectBuilder.getGeneratedTypes().stream()
                    .map(PoetTypeWithClassName::typeSpec)
                    .collect(Collectors.toList()));
            if (isSerialized) {
                typeSpecBuilder.addAnnotation(AnnotationSpec.builder(JsonInclude.class)
                        .addMember("value", "$T.Include.NON_EMPTY", JsonInclude.class)
                        .build());
                typeSpecBuilder.addAnnotation(AnnotationSpec.builder(JsonDeserialize.class)
                        .addMember("builder", "$T.class", objectBuilder.getBuilderImplClassName())
                        .build());
            }
        }
        if (objectClassName.enclosingClassName() != null) {
            typeSpecBuilder.addModifiers(Modifier.STATIC);
        }
        return typeSpecBuilder.build();
    }

    private MethodSpec generateConstructor() {
        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(publicConstructorsEnabled ? Modifier.PUBLIC : Modifier.PRIVATE);
        allEnrichedProperties.stream()
                .map(EnrichedObjectProperty::fieldSpec)
                .flatMap(Optional::stream)
                .forEach(fieldSpec -> {
                    ParameterSpec parameterSpec = ParameterSpec.builder(fieldSpec.type, fieldSpec.name)
                            .build();
                    constructorBuilder.addParameter(parameterSpec);
                    constructorBuilder.addStatement("this.$L = $L", fieldSpec.name, fieldSpec.name);
                });
        return constructorBuilder.build();
    }

    private EqualsMethod generateEqualsMethod() {
        return ObjectMethodFactory.createEqualsMethod(
                objectClassName,
                allEnrichedProperties.stream()
                        .map(EnrichedObjectProperty::fieldSpec)
                        .flatMap(Optional::stream)
                        .collect(Collectors.toList()));
    }

    private Optional<MethodSpec> generateHashCode() {
        return ObjectMethodFactory.createHashCodeMethod(allEnrichedProperties.stream()
                .map(EnrichedObjectProperty::fieldSpec)
                .flatMap(Optional::stream)
                .collect(Collectors.toList()));
    }

    private MethodSpec generateToString() {
        return ObjectMethodFactory.createToStringMethod(
                objectClassName,
                allEnrichedProperties.stream()
                        .map(EnrichedObjectProperty::fieldSpec)
                        .flatMap(Optional::stream)
                        .collect(Collectors.toList()));
    }

    private Optional<ObjectBuilder> generateBuilder() {
        BuilderGenerator builderGenerator = new BuilderGenerator(objectClassName, allEnrichedProperties, isSerialized);
        return builderGenerator.generate();
    }
}
