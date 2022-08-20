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

package com.fern.codegen.generator.auth;

import com.fasterxml.jackson.annotation.JsonValue;
import com.fern.codegen.GeneratedFile;
import com.fern.codegen.Generator;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.types.services.HttpHeader;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.Optional;
import javax.lang.model.element.Modifier;
import org.immutables.value.Value;
import org.immutables.value.Value.Style.ImplementationVisibility;

public class HeaderAuthGenerator extends Generator {
    private static final String VALUE_METHOD_NAME = "value";

    private final ClassName generatedClassName;
    private final ClassName generatedImmutablesClassName;

    public HeaderAuthGenerator(GeneratorContext generatorContext, PackageType packageType, HttpHeader httpHeader) {
        super(generatorContext);
        this.generatedClassName = generatorContext
                .getClassNameUtils()
                .getClassName(httpHeader.name().pascalCase(), Optional.of("Auth"), Optional.empty(), packageType);
        this.generatedImmutablesClassName =
                generatorContext.getImmutablesUtils().getImmutablesClassName(generatedClassName);
    }

    @Override
    public final GeneratedFile generate() {
        TypeSpec authHeaderTypeSpec = TypeSpec.classBuilder(generatedClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .addAnnotation(Value.Immutable.class)
                .addAnnotation(AnnotationSpec.builder(Value.Style.class)
                        .addMember(
                                "visibility",
                                "$T.$L.$L.$L",
                                Value.class,
                                Value.Style.class.getSimpleName(),
                                Value.Style.ImplementationVisibility.class.getSimpleName(),
                                ImplementationVisibility.PACKAGE.name())
                        .addMember("jdkOnly", "$L", true)
                        .build())
                .addMethod(MethodSpec.methodBuilder(VALUE_METHOD_NAME)
                        .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                        .returns(String.class)
                        .addAnnotation(Value.Parameter.class)
                        .addAnnotation(JsonValue.class)
                        .build())
                .addMethod(MethodSpec.methodBuilder("toString")
                        .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                        .returns(String.class)
                        .addAnnotation(Override.class)
                        .addStatement("return $L()", VALUE_METHOD_NAME)
                        .build())
                .addMethod(MethodSpec.methodBuilder("of")
                        .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                        .addParameter(String.class, "value")
                        .returns(generatedClassName)
                        .addStatement("$T.of($L)", generatedImmutablesClassName, "value")
                        .build())
                .build();
        JavaFile authHeaderFile = JavaFile.builder(generatedClassName.packageName(), authHeaderTypeSpec)
                .build();
        return GeneratedFile.builder()
                .file(authHeaderFile)
                .className(generatedClassName)
                .build();
    }
}
