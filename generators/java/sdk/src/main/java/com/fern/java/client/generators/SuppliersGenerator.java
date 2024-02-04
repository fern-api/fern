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

package com.fern.java.client.generators;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.TypeVariableName;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Supplier;
import javax.lang.model.element.Modifier;

public final class SuppliersGenerator extends AbstractFileGenerator {

    public static final String MEMOIZE_METHOD_NAME = "memoize";

    public SuppliersGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName("Suppliers"), generatorContext);
    }

    @Override
    public GeneratedJavaFile generateFile() {
        TypeSpec suppliersTypeSpec = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .build())
                .addMethod(createMemoizeMethod())
                .build();
        JavaFile environmentsFile =
                JavaFile.builder(className.packageName(), suppliersTypeSpec).build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(environmentsFile)
                .build();
    }

    private MethodSpec createMemoizeMethod() {
        TypeVariableName genericType = TypeVariableName.get("T");
        TypeName genericSupplier = ParameterizedTypeName.get(ClassName.get(Supplier.class), genericType);
        TypeName genericAtomicReference = ParameterizedTypeName.get(ClassName.get(AtomicReference.class), genericType);
        return MethodSpec.methodBuilder(MEMOIZE_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addTypeVariable(genericType)
                .returns(genericSupplier)
                .addParameter(genericSupplier, "delegate")
                .addStatement("$T value = new $T<>()", genericAtomicReference, AtomicReference.class)
                .beginControlFlow("return () -> ")
                .addStatement("$T val = value.get()", genericType)
                .beginControlFlow("if (val == null)")
                .addStatement(
                        "val = value.updateAndGet(cur -> cur == null ? $T.requireNonNull(delegate.get()) : cur)",
                        Objects.class)
                .endControlFlow()
                .addStatement("return val")
                .endControlFlow("")
                .build();
    }
}
