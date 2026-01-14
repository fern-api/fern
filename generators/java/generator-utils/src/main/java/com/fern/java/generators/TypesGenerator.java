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

import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.errors.ErrorDeclaration;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
import com.squareup.javapoet.ClassName;
import java.util.AbstractMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

public final class TypesGenerator {
    private final Map<TypeId, TypeDeclaration> typeDeclarations;
    private final Map<ErrorId, ErrorDeclaration> errorDeclarations;
    private final AbstractGeneratorContext<?, ?> generatorContext;

    public TypesGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        this.errorDeclarations = generatorContext.getIr().getErrors();
        this.typeDeclarations = generatorContext.getTypeDeclarations();
        this.generatorContext = generatorContext;
    }

    public Result generateFiles() {
        Map<TypeId, GeneratedJavaInterface> generatedInterfaces = getGeneratedInterfaces(generatorContext);
        // Use parallel stream for type generation - each type is independent
        Map<TypeId, GeneratedJavaFile> generatedTypes = typeDeclarations.entrySet().parallelStream()
                .map(entry -> {
                    TypeId typeId = entry.getKey();
                    TypeDeclaration typeDeclaration = entry.getValue();

                    if (generatorContext.getCustomConfig().enableInlineTypes()
                            && typeDeclaration.getInline().orElse(false)) {
                        return null;
                    }

                    ClassName className =
                            generatorContext.getPoetClassNameFactory().getTypeClassName(typeDeclaration.getName());
                    Optional<AbstractTypeGenerator> maybeGenerator = typeDeclaration
                            .getShape()
                            .visit(new SingleTypeGenerator(
                                    generatorContext,
                                    typeDeclaration.getName(),
                                    className,
                                    generatedInterfaces,
                                    false,
                                    Set.of(className.simpleName()),
                                    true));
                    return maybeGenerator
                            .map(gen -> new AbstractMap.SimpleEntry<>(typeId, gen.generateFile()))
                            .orElse(null);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toConcurrentMap(Map.Entry::getKey, Map.Entry::getValue));
        return new Result(generatedInterfaces, generatedTypes);
    }

    public static Map<TypeId, GeneratedJavaInterface> getGeneratedInterfaces(
            AbstractGeneratorContext<?, ?> generatorContext) {
        Set<TypeId> interfaceCandidates = generatorContext.getInterfaceIds();
        // Use parallel stream for interface generation - each interface is independent
        return interfaceCandidates.parallelStream().collect(Collectors.toConcurrentMap(Function.identity(), typeId -> {
            TypeDeclaration typeDeclaration =
                    generatorContext.getTypeDeclarations().get(typeId);
            ObjectTypeDeclaration objectTypeDeclaration = typeDeclaration
                    .getShape()
                    .getObject()
                    .orElseThrow(() -> new IllegalStateException("Non-objects cannot be extended. Fix type "
                            + typeDeclaration.getName().getName() + " located in file"
                            + typeDeclaration.getName().getFernFilepath()));
            InterfaceGenerator interfaceGenerator =
                    new InterfaceGenerator(generatorContext, typeDeclaration.getName(), objectTypeDeclaration);
            return interfaceGenerator.generateFile();
        }));
    }

    public static final class Result {
        private final Map<TypeId, GeneratedJavaInterface> interfaces;
        private final Map<TypeId, GeneratedJavaFile> types;

        public Result(Map<TypeId, GeneratedJavaInterface> interfaces, Map<TypeId, GeneratedJavaFile> types) {
            this.interfaces = interfaces;
            this.types = types;
        }

        public Map<TypeId, GeneratedJavaFile> getTypes() {
            return types;
        }

        public Map<TypeId, GeneratedJavaInterface> getInterfaces() {
            return interfaces;
        }
    }
}
