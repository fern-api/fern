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
package com.fern.model.codegen.types;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratedObject;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.IGeneratedFile;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.model.codegen.Generator;
import com.fern.types.DeclaredTypeName;
import com.fern.types.ObjectProperty;
import com.fern.types.ObjectTypeDeclaration;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.apache.commons.lang3.StringUtils;
import org.immutables.value.Value;

public final class ObjectGenerator extends Generator {

    private static final Modifier[] OBJECT_INTERFACE_MODIFIERS = new Modifier[] {Modifier.PUBLIC};

    private static final String STATIC_BUILDER_METHOD_NAME = "builder";
    private static final String BUILD_STAGE_SUFFIX = "BuildStage";

    private final DeclaredTypeName declaredTypeName;
    private final ObjectTypeDeclaration objectTypeDeclaration;
    private final List<GeneratedInterface> extendedInterfaces;
    private final Optional<GeneratedInterface> selfInterface;
    private final ClassName generatedObjectClassName;
    private final ClassName generatedObjectImmutablesClassName;

    public ObjectGenerator(
            DeclaredTypeName declaredTypeName,
            PackageType packageType,
            ObjectTypeDeclaration objectTypeDeclaration,
            List<GeneratedInterface> extendedInterfaces,
            Optional<GeneratedInterface> selfInterface,
            GeneratorContext generatorContext) {
        super(generatorContext, packageType);
        this.declaredTypeName = declaredTypeName;
        this.objectTypeDeclaration = objectTypeDeclaration;
        this.extendedInterfaces = extendedInterfaces;
        this.selfInterface = selfInterface;
        this.generatedObjectClassName =
                generatorContext.getClassNameUtils().getClassNameFromDeclaredTypeName(declaredTypeName, packageType);
        this.generatedObjectImmutablesClassName =
                generatorContext.getImmutablesUtils().getImmutablesClassName(generatedObjectClassName);
    }

    @Override
    public GeneratedObject generate() {
        TypeSpec.Builder objectTypeSpecBuilder = TypeSpec.interfaceBuilder(generatedObjectClassName)
                .addModifiers(OBJECT_INTERFACE_MODIFIERS)
                .addAnnotations(getAnnotations())
                .addSuperinterfaces(getSuperInterfaces());
        Map<ObjectProperty, MethodSpec> methodSpecsByProperty = Collections.emptyMap();
        if (selfInterface.isEmpty()) {
            methodSpecsByProperty =
                    generatorContext.getImmutablesUtils().getOrderedImmutablesPropertyMethods(objectTypeDeclaration);
        }
        objectTypeSpecBuilder
                .addMethods(methodSpecsByProperty.values())
                .addMethod(generateStaticBuilder(methodSpecsByProperty));
        TypeSpec objectTypeSpec = objectTypeSpecBuilder.build();
        JavaFile objectFile = JavaFile.builder(generatedObjectClassName.packageName(), objectTypeSpec)
                .build();
        return GeneratedObject.builder()
                .file(objectFile)
                .className(generatedObjectClassName)
                .objectTypeDeclaration(objectTypeDeclaration)
                .build();
    }

    private List<AnnotationSpec> getAnnotations() {
        List<AnnotationSpec> annotationSpecs = new ArrayList<>();
        annotationSpecs.add(AnnotationSpec.builder(Value.Immutable.class).build());
        annotationSpecs.add(AnnotationSpec.builder(ClassName.get(StagedBuilderImmutablesStyle.class))
                .build());
        annotationSpecs.add(AnnotationSpec.builder(JsonDeserialize.class)
                .addMember("as", "$T.class", generatedObjectImmutablesClassName)
                .build());
        annotationSpecs.add(AnnotationSpec.builder(JsonIgnoreProperties.class)
                .addMember("ignoreUnknown", "$L", Boolean.TRUE.toString())
                .build());
        return annotationSpecs;
    }

    private List<TypeName> getSuperInterfaces() {
        List<TypeName> superInterfaces = new ArrayList<>();
        superInterfaces.addAll(
                extendedInterfaces.stream().map(IGeneratedFile::className).collect(Collectors.toList()));
        selfInterface.ifPresent(generatedInterface -> superInterfaces.add(generatedInterface.className()));
        return superInterfaces;
    }

    private MethodSpec generateStaticBuilder(Map<ObjectProperty, MethodSpec> methodSpecsByProperty) {
        Optional<String> firstMandatoryFieldName =
                getFirstRequiredFieldName(extendedInterfaces, selfInterface, methodSpecsByProperty);
        ClassName builderClassName = firstMandatoryFieldName.isEmpty()
                ? generatedObjectImmutablesClassName.nestedClass("Builder")
                : generatedObjectImmutablesClassName.nestedClass(
                        StringUtils.capitalize(firstMandatoryFieldName.get()) + BUILD_STAGE_SUFFIX);
        return MethodSpec.methodBuilder(STATIC_BUILDER_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(builderClassName)
                .addCode("return $T.builder();", generatedObjectImmutablesClassName)
                .build();
    }

    private static Optional<String> getFirstRequiredFieldName(
            List<GeneratedInterface> superInterfaces,
            Optional<GeneratedInterface> selfInterface,
            Map<ObjectProperty, MethodSpec> methodSpecsByProperty) {
        // Required field from super interfaces take priority
        for (GeneratedInterface superInterface : superInterfaces) {
            Optional<String> firstMandatoryFieldName =
                    getFirstRequiredFieldName(superInterface.methodSpecsByProperties());
            if (firstMandatoryFieldName.isPresent()) {
                return firstMandatoryFieldName;
            }
        }
        if (selfInterface.isPresent()) {
            return getFirstRequiredFieldName(selfInterface.get().methodSpecsByProperties());
        }
        return getFirstRequiredFieldName(methodSpecsByProperty);
    }

    private static Optional<String> getFirstRequiredFieldName(Map<ObjectProperty, MethodSpec> methodSpecsByProperty) {
        for (Map.Entry<ObjectProperty, MethodSpec> entry : methodSpecsByProperty.entrySet()) {
            ObjectProperty property = entry.getKey();
            if (property.valueType().isPrimitive() || property.valueType().isNamed()) {
                return Optional.of(entry.getValue().name);
            }
        }
        return Optional.empty();
    }
}
