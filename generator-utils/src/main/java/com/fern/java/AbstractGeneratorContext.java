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
import com.fern.ir.v9.model.commons.ErrorId;
import com.fern.ir.v9.model.commons.TypeId;
import com.fern.ir.v9.model.errors.ErrorDeclaration;
import com.fern.ir.v9.model.ir.IntermediateRepresentation;
import com.fern.ir.v9.model.types.TypeDeclaration;
import java.util.Map;

public abstract class AbstractGeneratorContext<T extends AbstractPoetClassNameFactory> {

    private final IntermediateRepresentation ir;
    private final GeneratorConfig generatorConfig;
    private final T poetClassNameFactory;
    private final PoetTypeNameMapper poetTypeNameMapper;
    private final Map<TypeId, TypeDeclaration> typeDefinitionsByName;
    private final Map<ErrorId, ErrorDeclaration> errorDefinitionsByName;
    private final GlobalHeaders globalHeaders;
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
        this.typeDefinitionsByName = ir.getTypes();
        this.poetTypeNameMapper = new PoetTypeNameMapper(poetClassNameFactory, customConfig, typeDefinitionsByName);
        this.errorDefinitionsByName = ir.getErrors();
        this.globalHeaders = new GlobalHeaders(ir, poetTypeNameMapper);
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

    public final Map<TypeId, TypeDeclaration> getTypeDeclarations() {
        return typeDefinitionsByName;
    }

    public final Map<ErrorId, ErrorDeclaration> getErrorDeclarations() {
        return errorDefinitionsByName;
    }

    public final GlobalHeaders getGlobalHeaders() {
        return globalHeaders;
    }
}
