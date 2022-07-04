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
package com.fern.model.codegen;

import com.fern.codegen.GeneratorContext;
import com.fern.codegen.IGeneratedFile;
import com.fern.codegen.utils.ClassNameUtils.PackageType;

public abstract class Generator {

    @SuppressWarnings("VisibilityModifier")
    protected final GeneratorContext generatorContext;

    @SuppressWarnings("VisibilityModifier")
    protected final PackageType packageType;

    public Generator(GeneratorContext generatorContext, PackageType packageType) {
        this.generatorContext = generatorContext;
        this.packageType = packageType;
    }

    public abstract IGeneratedFile generate();
}
