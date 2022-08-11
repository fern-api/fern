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
import com.fern.codegen.GeneratorContext;
import com.fern.model.codegen.Generator;
import com.fern.types.DeclaredTypeName;
import com.fern.types.ObjectProperty;
import com.fern.types.ObjectTypeDeclaration;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.Map;
import javax.lang.model.element.Modifier;

public final class InterfaceGenerator extends Generator {

    private static final String INTERFACE_PREFIX = "I";

    private final ObjectTypeDeclaration objectTypeDeclaration;
    private final DeclaredTypeName declaredTypeName;

    public InterfaceGenerator(
            ObjectTypeDeclaration objectTypeDeclaration,
            DeclaredTypeName declaredTypeName,
            GeneratorContext generatorContext) {
        super(generatorContext);
        this.objectTypeDeclaration = objectTypeDeclaration;
        this.declaredTypeName = DeclaredTypeName.builder()
                .fernFilepath(declaredTypeName.fernFilepath())
                .name(INTERFACE_PREFIX + declaredTypeName.name())
                .build();
    }

    @Override
    public GeneratedInterface generate() {
        ClassName generatedInterfaceClassName =
                generatorContext.getClassNameUtils().getClassNameFromDeclaredTypeName(declaredTypeName);
        Map<ObjectProperty, MethodSpec> methodSpecsByProperties =
                generatorContext.getImmutablesUtils().getOrderedImmutablesPropertyMethods(objectTypeDeclaration);
        TypeSpec interfaceTypeSpec = TypeSpec.interfaceBuilder(generatedInterfaceClassName.simpleName())
                .addModifiers(Modifier.PUBLIC)
                .addMethods(methodSpecsByProperties.values())
                .build();
        JavaFile interfaceFile = JavaFile.builder(generatedInterfaceClassName.packageName(), interfaceTypeSpec)
                .build();
        return GeneratedInterface.builder()
                .file(interfaceFile)
                .className(generatedInterfaceClassName)
                .objectTypeDeclaration(objectTypeDeclaration)
                .putAllMethodSpecsByProperties(methodSpecsByProperties)
                .build();
    }
}
