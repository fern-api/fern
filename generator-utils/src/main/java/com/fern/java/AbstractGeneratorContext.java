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

package com.fern.java;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.ir.model.errors.DeclaredErrorName;
import com.fern.ir.model.errors.ErrorDeclaration;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.TypeDeclaration;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public abstract class AbstractGeneratorContext<T extends AbstractPoetClassNameFactory> {

    private final IntermediateRepresentation ir;
    private final GeneratorConfig generatorConfig;
    private final T poetClassNameFactory;
    private final PoetTypeNameMapper poetTypeNameMapper;
    private final Map<DeclaredTypeName, TypeDeclaration> typeDefinitionsByName;
    private final Map<DeclaredErrorName, ErrorDeclaration> errorDefinitionsByName;

    private final CustomConfig customConfig;

    public AbstractGeneratorContext(
            IntermediateRepresentation ir,
            GeneratorConfig generatorConfig,
            CustomConfig customConfig,
            T poetClassNameFactory) {
        this.ir = ir;
        this.generatorConfig = generatorConfig;
        this.customConfig = customConfig;
        this.poetClassNameFactory = poetClassNameFactory;
        this.typeDefinitionsByName = ir.getTypes().stream()
                .collect(Collectors.toUnmodifiableMap(TypeDeclaration::getName, Function.identity()));
        this.poetTypeNameMapper = new PoetTypeNameMapper(poetClassNameFactory, customConfig, typeDefinitionsByName);
        this.errorDefinitionsByName = ir.getErrors().stream()
                .collect(Collectors.toUnmodifiableMap(ErrorDeclaration::getName, Function.identity()));
    }

    public final IntermediateRepresentation getIr() {
        return ir;
    }

    public final GeneratorConfig getGeneratorConfig() {
        return generatorConfig;
    }

    public final CustomConfig getCustomConfig() {
        return customConfig;
    }

    public final T getPoetClassNameFactory() {
        return poetClassNameFactory;
    }

    public final PoetTypeNameMapper getPoetTypeNameMapper() {
        return poetTypeNameMapper;
    }

    public final Map<DeclaredTypeName, TypeDeclaration> getTypeDefinitionsByName() {
        return typeDefinitionsByName;
    }

    public final Map<DeclaredErrorName, ErrorDeclaration> getErrorDefinitionsByName() {
        return errorDefinitionsByName;
    }
}
