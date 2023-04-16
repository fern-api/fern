/*
 * (c) Copyright 2023 Birch Solutions Inc. All rights reserved.
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
package com.fern.java.spring.generators;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.TypeSpec;
import javax.lang.model.element.Modifier;

public final class ApiExceptionGenerator extends AbstractFileGenerator {

    public static final String API_EXCEPTION_CLASSNAME = "APIException";

    public ApiExceptionGenerator(AbstractGeneratorContext<?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName(API_EXCEPTION_CLASSNAME), generatorContext);
    }

    @Override
    public GeneratedJavaFile generateFile() {
        TypeSpec apiExceptionTypeSpec = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC)
                .superclass(Exception.class)
                .build();
        JavaFile javaFile =
                JavaFile.builder(className.packageName(), apiExceptionTypeSpec).build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }
}
