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

import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedInterfaceOutput;
import com.fern.java.output.GeneratedInterfaceOutput.PropertyMethodSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class InterfaceGenerator extends AbstractFileGenerator {

    private final ObjectTypeDeclaration objectTypeDeclaration;

    public InterfaceGenerator(
            ClassName className,
            AbstractGeneratorContext generatorContext,
            ObjectTypeDeclaration objectTypeDeclaration) {
        super(className, generatorContext);
        this.objectTypeDeclaration = objectTypeDeclaration;
    }

    @Override
    public GeneratedInterfaceOutput generateFile() {
        List<PropertyMethodSpec> methodSpecsByProperties = getPropertyGetters();
        TypeSpec interfaceTypeSpec = TypeSpec.interfaceBuilder(className)
                .addModifiers(Modifier.PUBLIC)
                .addMethods(methodSpecsByProperties.stream()
                        .map(PropertyMethodSpec::methodSpec)
                        .collect(Collectors.toList()))
                .build();
        JavaFile interfaceFile =
                JavaFile.builder(className.packageName(), interfaceTypeSpec).build();
        return GeneratedInterfaceOutput.builder()
                .className(className)
                .javaFile(interfaceFile)
                .addAllPropertyMethodSpecs(methodSpecsByProperties)
                .build();
    }

    private List<PropertyMethodSpec> getPropertyGetters() {
        return objectTypeDeclaration.getProperties().stream()
                .map(objectProperty -> {
                    TypeName poetTypeName = generatorContext
                            .getPoetTypeNameMapper()
                            .convertToTypeName(true, objectProperty.getValueType());
                    MethodSpec getter = MethodSpec.methodBuilder(
                                    "get" + objectProperty.getName().getPascalCase())
                            .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                            .returns(poetTypeName)
                            .build();
                    return PropertyMethodSpec.builder()
                            .objectProperty(objectProperty)
                            .methodSpec(getter)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
