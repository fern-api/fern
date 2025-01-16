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

import com.fern.ir.model.types.ObjectProperty;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.output.GeneratedObject;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Map;

public final class ObjectGenerator extends AbstractFileGenerator {
    private final TypeSpec objectTypeSpec;
    private final Map<ObjectProperty, EnrichedObjectProperty> objectPropertyGetters;
    private final List<EnrichedObjectProperty> extendedPropertyGetters;

    public ObjectGenerator(
            AbstractGeneratorContext<?, ?> generatorContext,
            ClassName className,
            TypeSpec objectTypeSpec,
            Map<ObjectProperty, EnrichedObjectProperty> objectPropertyGetters,
            List<EnrichedObjectProperty> extendedPropertyGetters) {
        super(className, generatorContext);
        this.objectTypeSpec = objectTypeSpec;
        this.objectPropertyGetters = objectPropertyGetters;
        this.extendedPropertyGetters = extendedPropertyGetters;
    }

    @Override
    public GeneratedObject generateFile() {
        JavaFile javaFile =
                JavaFile.builder(className.packageName(), objectTypeSpec).build();
        return GeneratedObject.builder()
                .className(className)
                .javaFile(javaFile)
                .putAllObjectPropertyGetters(objectPropertyGetters)
                .addAllExtendedObjectPropertyGetters(extendedPropertyGetters)
                .build();
    }
}
