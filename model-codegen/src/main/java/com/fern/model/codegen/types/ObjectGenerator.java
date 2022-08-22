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

import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratedObject;
import com.fern.codegen.Generator;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.generator.object.EnrichedObjectProperty;
import com.fern.codegen.generator.object.GenericObjectGenerator;
import com.fern.codegen.generator.object.ImplementsInterface;
import com.fern.types.DeclaredTypeName;
import com.fern.types.ObjectTypeDeclaration;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class ObjectGenerator extends Generator {

    private static final Modifier[] OBJECT_INTERFACE_MODIFIERS = new Modifier[] {Modifier.PUBLIC};

    private static final String STATIC_BUILDER_METHOD_NAME = "builder";
    private static final String BUILD_STAGE_SUFFIX = "BuildStage";

    private final DeclaredTypeName declaredTypeName;
    private final ObjectTypeDeclaration objectTypeDeclaration;
    private final List<GeneratedInterface> extendedInterfaces = new ArrayList<>();
    private final ClassName generatedObjectClassName;

    public ObjectGenerator(
            DeclaredTypeName declaredTypeName,
            ObjectTypeDeclaration objectTypeDeclaration,
            List<GeneratedInterface> extendedInterfaces,
            Optional<GeneratedInterface> selfInterface,
            GeneratorContext generatorContext,
            ClassName objectClassName) {
        super(generatorContext);
        this.declaredTypeName = declaredTypeName;
        this.objectTypeDeclaration = objectTypeDeclaration;
        this.extendedInterfaces.addAll(extendedInterfaces);
        selfInterface.ifPresent(extendedInterfaces::add);
        this.generatedObjectClassName = objectClassName;
    }

    @Override
    public GeneratedObject generate() {
        List<EnrichedObjectProperty> enrichedObjectProperties = objectTypeDeclaration.properties().stream()
                .map(objectProperty ->
                        EnrichedObjectProperty.of(objectProperty, false, generatorContext.getClassNameUtils()))
                .collect(Collectors.toList());
        List<ImplementsInterface> implementsInterfaces = extendedInterfaces.stream()
                .map(generatedInterface -> ImplementsInterface.builder()
                        .interfaceClassName(generatedInterface.className())
                        .addAllInterfaceProperties(generatedInterface.objectTypeDeclaration().properties().stream()
                                .map(objectProperty -> EnrichedObjectProperty.of(
                                        objectProperty, true, generatorContext.getClassNameUtils()))
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
        GenericObjectGenerator genericObjectGenerator = new GenericObjectGenerator(
                generatedObjectClassName, enrichedObjectProperties, implementsInterfaces, true);
        TypeSpec objectTypeSpec = genericObjectGenerator.generate();
        JavaFile objectFile = JavaFile.builder(generatedObjectClassName.packageName(), objectTypeSpec)
                .build();
        return GeneratedObject.builder()
                .file(objectFile)
                .className(generatedObjectClassName)
                .objectTypeDeclaration(objectTypeDeclaration)
                .build();
    }
}
