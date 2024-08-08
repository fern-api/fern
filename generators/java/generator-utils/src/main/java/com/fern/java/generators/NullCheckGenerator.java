/*
 * (c) Copyright 2024 Birch Solutions Inc. All rights reserved.
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

 import com.fern.java.AbstractGeneratorContext;
 import com.fern.java.output.GeneratedResourcesJavaFile;
 import java.io.IOException;
 import java.io.InputStream;
 import java.nio.charset.StandardCharsets;
 
 public final class NullCheckGenerator extends AbstractFileGenerator {
 
     public static final String GET_MODULE_METHOD_NAME = "getModule";
 
     public NullCheckGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
         super(generatorContext.getPoetClassNameFactory().getNullCheckClassName(), generatorContext);
     }
 
     @Override
     public GeneratedResourcesJavaFile generateFile() {
        return GeneratedResourcesJavaFile.builder()
                .className(className)
                .contents(contents)
                .build();
     }
 }
 