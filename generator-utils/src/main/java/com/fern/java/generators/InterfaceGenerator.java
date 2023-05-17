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

import com.fern.irV12.model.types.DeclaredTypeName;
import com.fern.irV12.model.types.ObjectTypeDeclaration;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedJavaInterface.PropertyMethodSpec;
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
            AbstractGeneratorContext<?> generatorContext,
            DeclaredTypeName declaredTypeName,
            ObjectTypeDeclaration objectTypeDeclaration) {
        super(generatorContext.getPoetClassNameFactory().getInterfaceClassName(declaredTypeName), generatorContext);
        this.objectTypeDeclaration = objectTypeDeclaration;
    }

    @Override
    public GeneratedJavaInterface generateFile() {
        List<PropertyMethodSpec> methodSpecsByProperties = getPropertyGetters();
        List<ClassName> superInterfaces = objectTypeDeclaration.getExtends().stream()
                .map(declaredTypeName ->
                        generatorContext.getPoetClassNameFactory().getInterfaceClassName(declaredTypeName))
                .collect(Collectors.toList());
        TypeSpec interfaceTypeSpec = TypeSpec.interfaceBuilder(className)
                .addModifiers(Modifier.PUBLIC)
                .addSuperinterfaces(superInterfaces)
                .addMethods(methodSpecsByProperties.stream()
                        .map(PropertyMethodSpec::methodSpec)
                        .collect(Collectors.toList()))
                .build();
        JavaFile interfaceFile =
                JavaFile.builder(className.packageName(), interfaceTypeSpec).build();
        return GeneratedJavaInterface.builder()
                .className(className)
                .javaFile(interfaceFile)
                .addAllPropertyMethodSpecs(methodSpecsByProperties)
                .addAllExtendedInterfaces(objectTypeDeclaration.getExtends())
                .build();
    }

    private List<PropertyMethodSpec> getPropertyGetters() {
        return objectTypeDeclaration.getProperties().stream()
                .map(objectProperty -> {
                    TypeName poetTypeName = generatorContext
                            .getPoetTypeNameMapper()
                            .convertToTypeName(true, objectProperty.getValueType());
                    MethodSpec getter = MethodSpec.methodBuilder("get"
                                    + objectProperty
                                            .getName()
                                            .getName()
                                            .getPascalCase()
                                            .getSafeName())
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
