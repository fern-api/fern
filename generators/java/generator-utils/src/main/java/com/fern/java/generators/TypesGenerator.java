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
import com.palantir.common.streams.KeyedStream;
import com.squareup.javapoet.ClassName;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Map;
import java.util.Optional;
import java.util.Queue;
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

        Set<TypeId> nestedInlineTypeIds = generatorContext.getCustomConfig().enableInlineTypes()
                ? computeNestedInlineTypeIds()
                : Set.of();

        Map<TypeId, GeneratedJavaFile> generatedTypes = KeyedStream.stream(typeDeclarations)
                .map(typeDeclaration -> {
                    if (generatorContext.getCustomConfig().enableInlineTypes()
                            && typeDeclaration.getInline().orElse(false)
                            && nestedInlineTypeIds.contains(
                                    typeDeclaration.getName().getTypeId())) {
                        return Optional.<GeneratedJavaFile>empty();
                    }

                    ClassName className =
                            generatorContext.getPoetClassNameFactory().getTypeClassName(typeDeclaration.getName());
                    Optional<AbstractTypeGenerator> maybeGeneratedJavaFile = typeDeclaration
                            .getShape()
                            .visit(new SingleTypeGenerator(
                                    generatorContext,
                                    typeDeclaration.getName(),
                                    className,
                                    generatedInterfaces,
                                    false,
                                    Set.of(className.simpleName()),
                                    true));
                    return maybeGeneratedJavaFile.map(AbstractTypeGenerator::generateFile);
                })
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collectToMap();
        return new Result(generatedInterfaces, generatedTypes);
    }

    /**
     * Computes the set of inline TypeIds that are reachable from at least one non-inline type
     * declaration. These inline types will be generated as nested classes inside their parent
     * types and should be skipped during standalone file generation.
     *
     * Inline types that are NOT in this set (e.g., those only referenced from endpoint response
     * types) must still be generated as standalone files.
     */
    private Set<TypeId> computeNestedInlineTypeIds() {
        Set<TypeId> nestedInlineTypeIds = new HashSet<>();
        Queue<TypeId> queue = new LinkedList<>();

        for (Map.Entry<TypeId, TypeDeclaration> entry : typeDeclarations.entrySet()) {
            if (!entry.getValue().getInline().orElse(false)) {
                queue.add(entry.getKey());
            }
        }

        while (!queue.isEmpty()) {
            TypeId current = queue.poll();
            TypeDeclaration currentDecl = typeDeclarations.get(current);
            if (currentDecl == null) {
                continue;
            }
            for (TypeId referencedId : currentDecl.getReferencedTypes()) {
                TypeDeclaration referencedDecl = typeDeclarations.get(referencedId);
                if (referencedDecl != null
                        && referencedDecl.getInline().orElse(false)
                        && nestedInlineTypeIds.add(referencedId)) {
                    queue.add(referencedId);
                }
            }
        }

        return nestedInlineTypeIds;
    }

    public static Map<TypeId, GeneratedJavaInterface> getGeneratedInterfaces(
            AbstractGeneratorContext<?, ?> generatorContext) {
        Set<TypeId> interfaceCandidates = generatorContext.getInterfaceIds();
        return interfaceCandidates.stream().collect(Collectors.toMap(Function.identity(), typeId -> {
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
