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

package com.fern.java.client.generators;

import com.fern.ir.model.services.http.HttpHeader;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.generators.AbstractOptionalFileGenerator;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.generators.object.ObjectTypeSpecGenerator;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.TypeSpec;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public final class ClientOptionsGenerator extends AbstractOptionalFileGenerator {

    public ClientOptionsGenerator(AbstractGeneratorContext<?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName("ClientOptions"), generatorContext);
    }

    @Override
    public Optional<GeneratedClientOptions> generateFile() {
        List<HttpHeader> optionalGlobalHeaders =
                generatorContext.getGlobalHeaders().getOptionalGlobalHeaders();
        if (optionalGlobalHeaders.isEmpty()) {
            return Optional.empty();
        }
        List<EnrichedObjectProperty> enrichedObjectProperties = optionalGlobalHeaders.stream()
                .map(optionalApiWideHeader -> EnrichedObjectProperty.builder()
                        .camelCaseKey(optionalApiWideHeader.getName().getCamelCase())
                        .pascalCaseKey(optionalApiWideHeader.getName().getPascalCase())
                        .poetTypeName(generatorContext
                                .getPoetTypeNameMapper()
                                .convertToTypeName(true, optionalApiWideHeader.getValueType()))
                        .fromInterface(false)
                        .build())
                .collect(Collectors.toList());
        ObjectTypeSpecGenerator genericObjectGenerator =
                new ObjectTypeSpecGenerator(className, enrichedObjectProperties, Collections.emptyList(), true);
        TypeSpec objectTypeSpec = genericObjectGenerator.generate();
        JavaFile javaFile =
                JavaFile.builder(className.packageName(), objectTypeSpec).build();
        return Optional.of(GeneratedClientOptions.builder()
                .className(className)
                .javaFile(javaFile)
                .addAllOptionalGlobalHeaderMethodSpecs(enrichedObjectProperties.stream()
                        .map(EnrichedObjectProperty::getterProperty)
                        .collect(Collectors.toList()))
                .build());
    }
}
