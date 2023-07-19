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

import com.fern.irV16.model.commons.TypeId;
import com.fern.irV16.model.types.AliasTypeDeclaration;
import com.fern.irV16.model.types.DeclaredTypeName;
import com.fern.irV16.model.types.EnumTypeDeclaration;
import com.fern.irV16.model.types.ObjectTypeDeclaration;
import com.fern.irV16.model.types.Type;
import com.fern.irV16.model.types.UndiscriminatedUnionTypeDeclaration;
import com.fern.irV16.model.types.UnionTypeDeclaration;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObject;
import com.squareup.javapoet.ClassName;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public final class SingleTypeGenerator implements Type.Visitor<Optional<GeneratedJavaFile>> {

    private final AbstractGeneratorContext<?, ?> generatorContext;
    private final DeclaredTypeName declaredTypeName;
    private final ClassName className;
    private final Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces;
    private final boolean fromErrorDeclaration;
    private final boolean publicConstructorsEnabled;

    public SingleTypeGenerator(
            AbstractGeneratorContext<?, ?> generatorContext,
            DeclaredTypeName declaredTypeName,
            ClassName className,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces,
            boolean fromErrorDeclaration,
            boolean publicConstructorsEnabled) {
        this.generatorContext = generatorContext;
        this.className = className;
        this.allGeneratedInterfaces = allGeneratedInterfaces;
        this.declaredTypeName = declaredTypeName;
        this.fromErrorDeclaration = fromErrorDeclaration;
        this.publicConstructorsEnabled = publicConstructorsEnabled;
    }

    @Override
    public Optional<GeneratedJavaFile> visitAlias(AliasTypeDeclaration value) {
        if (generatorContext.getCustomConfig().wrappedAliases() || fromErrorDeclaration) {
            AliasGenerator aliasGenerator =
                    new AliasGenerator(className, generatorContext, value, publicConstructorsEnabled);
            return Optional.of(aliasGenerator.generateFile());
        }
        return Optional.empty();
    }

    @Override
    public Optional<GeneratedJavaFile> visitEnum(EnumTypeDeclaration value) {
        EnumGenerator forwardCompatibleEnumGenerator = new EnumGenerator(className, generatorContext, value);
        return Optional.of(forwardCompatibleEnumGenerator.generateFile());
    }

    @Override
    public Optional<GeneratedJavaFile> visitObject(ObjectTypeDeclaration value) {
        List<GeneratedJavaInterface> extendedInterfaces = value.getExtends().stream()
                .map(DeclaredTypeName::getTypeId)
                .map(allGeneratedInterfaces::get)
                .collect(Collectors.toList());
        ObjectGenerator objectGenerator = new ObjectGenerator(
                value,
                Optional.ofNullable(allGeneratedInterfaces.get(declaredTypeName.getTypeId())),
                extendedInterfaces,
                generatorContext,
                allGeneratedInterfaces,
                className,
                publicConstructorsEnabled);
        GeneratedObject generatedObject = objectGenerator.generateFile();
        return Optional.of(GeneratedJavaFile.builder()
                .className(generatedObject.getClassName())
                .javaFile(generatedObject.javaFile())
                .build());
    }

    @Override
    public Optional<GeneratedJavaFile> visitUnion(UnionTypeDeclaration value) {
        UnionGenerator unionGenerator = new UnionGenerator(className, generatorContext, value);
        return Optional.of(unionGenerator.generateFile());
    }

    @Override
    public Optional<GeneratedJavaFile> visitUndiscriminatedUnion(
            UndiscriminatedUnionTypeDeclaration undiscriminatedUnion) {
        UndiscriminatedUnionGenerator unionGenerator =
                new UndiscriminatedUnionGenerator(className, generatorContext, undiscriminatedUnion);
        return Optional.of(unionGenerator.generateFile());
    }

    @Override
    public Optional<GeneratedJavaFile> _visitUnknown(Object unknown) {
        throw new RuntimeException("Encountered unknown type: " + unknown);
    }
}
