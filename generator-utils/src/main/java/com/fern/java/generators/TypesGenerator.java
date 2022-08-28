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

import com.fern.ir.model.errors.ErrorDeclaration;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.Type;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.AbstractGeneratedFileOutput;
import com.fern.java.output.GeneratedInterfaceOutput;
import com.squareup.javapoet.ClassName;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

public final class TypesGenerator {
    private final List<TypeDeclaration> typeDeclarations;
    private final List<ErrorDeclaration> errorDeclarations;
    private final Map<DeclaredTypeName, TypeDeclaration> typeDeclarationsByName;
    private final AbstractGeneratorContext generatorContext;

    public TypesGenerator(AbstractGeneratorContext generatorContext) {
        this.typeDeclarations = generatorContext.getIr().getTypes();
        this.errorDeclarations = generatorContext.getIr().getErrors();
        this.typeDeclarationsByName = generatorContext.getTypeDefinitionsByName();
        this.generatorContext = generatorContext;
    }

    public Result generateFiles() {
        Map<DeclaredTypeName, GeneratedInterfaceOutput> generatedInterfaces = getGeneratedInterfaces();
        Map<DeclaredTypeName, AbstractGeneratedFileOutput> generatedTypes = typeDeclarations.stream()
                .collect(Collectors.toMap(TypeDeclaration::getName, typeDeclaration -> {
                    ClassName className =
                            generatorContext.getPoetClassNameFactory().getTypeClassName(typeDeclaration.getName());
                    return typeDeclaration
                            .getShape()
                            .visit(new SingleTypeGenerator(
                                    generatorContext, typeDeclaration.getName(), className, generatedInterfaces));
                }));
        return new Result(generatedInterfaces, generatedTypes);
    }

    private Map<DeclaredTypeName, GeneratedInterfaceOutput> getGeneratedInterfaces() {
        Set<DeclaredTypeName> interfaceCandidates = typeDeclarations.stream()
                .map(TypeDeclaration::getShape)
                .map(Type::getObject)
                .flatMap(Optional::stream)
                .map(ObjectTypeDeclaration::getExtends)
                .flatMap(List::stream)
                .collect(Collectors.toSet());
        return interfaceCandidates.stream().collect(Collectors.toMap(Function.identity(), namedType -> {
            TypeDeclaration typeDeclaration = typeDeclarationsByName.get(namedType);
            ObjectTypeDeclaration objectTypeDeclaration = typeDeclaration
                    .getShape()
                    .getObject()
                    .orElseThrow(() -> new IllegalStateException("Non-objects cannot be extended. Fix type "
                            + typeDeclaration.getName().getName() + " located in file"
                            + typeDeclaration.getName().getFernFilepath()));
            ClassName interfaceClassName =
                    generatorContext.getPoetClassNameFactory().getInterfaceClassName(typeDeclaration.getName());
            InterfaceGenerator interfaceGenerator =
                    new InterfaceGenerator(interfaceClassName, generatorContext, objectTypeDeclaration);
            return interfaceGenerator.generateFile();
        }));
    }

    public static final class Result {
        private final Map<DeclaredTypeName, GeneratedInterfaceOutput> interfaces;
        private final Map<DeclaredTypeName, AbstractGeneratedFileOutput> types;

        public Result(
                Map<DeclaredTypeName, GeneratedInterfaceOutput> interfaces,
                Map<DeclaredTypeName, AbstractGeneratedFileOutput> types) {
            this.interfaces = interfaces;
            this.types = types;
        }

        public Map<DeclaredTypeName, AbstractGeneratedFileOutput> getTypes() {
            return types;
        }

        public Map<DeclaredTypeName, GeneratedInterfaceOutput> getInterfaces() {
            return interfaces;
        }
    }
}
