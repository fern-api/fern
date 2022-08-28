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

package com.fern.java.generators.object;

import com.fern.java.PoetTypeWithClassName;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.MethodSpec;
import java.util.List;

public final class ObjectBuilder {

    private final List<PoetTypeWithClassName> generatedTypes;

    private final MethodSpec builderStaticMethod;

    private final ClassName builderImplClassName;

    public ObjectBuilder(
            List<PoetTypeWithClassName> generatedTypes,
            MethodSpec builderStaticMethod,
            ClassName builderImplClassName) {
        this.generatedTypes = generatedTypes;
        this.builderStaticMethod = builderStaticMethod;
        this.builderImplClassName = builderImplClassName;
    }

    public List<PoetTypeWithClassName> getGeneratedTypes() {
        return generatedTypes;
    }

    public MethodSpec getBuilderStaticMethod() {
        return builderStaticMethod;
    }

    public ClassName getBuilderImplClassName() {
        return builderImplClassName;
    }
}
