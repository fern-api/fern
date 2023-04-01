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

package com.fern.java.model;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.ir.v11.model.ir.IntermediateRepresentation;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.CustomConfig;

public class ModelGeneratorContext extends AbstractGeneratorContext<ModelPoetClassNameFactory> {

    public ModelGeneratorContext(
            IntermediateRepresentation ir, GeneratorConfig generatorConfig, CustomConfig customConfig) {
        super(ir, generatorConfig, customConfig, new ModelPoetClassNameFactory(ir, generatorConfig.getOrganization()));
    }
}
