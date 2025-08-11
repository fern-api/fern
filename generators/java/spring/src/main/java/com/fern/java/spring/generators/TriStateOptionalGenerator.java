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
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.TypeVariableName;
import java.util.Objects;
import java.util.Optional;
import javax.lang.model.element.Modifier;

public final class TriStateOptionalGenerator extends AbstractFileGenerator {

    public TriStateOptionalGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(ClassName.get("core", "TriStateOptional"), generatorContext);
    }

    @Override
    public GeneratedJavaFile generateFile() {
        TypeVariableName typeVariable = TypeVariableName.get("T");

        // State enum
        TypeSpec stateEnum = TypeSpec.enumBuilder("State")
                .addModifiers(Modifier.PRIVATE)
                .addEnumConstant("ABSENT")
                .addEnumConstant("NULL")
                .addEnumConstant("PRESENT")
                .build();

        FieldSpec stateField = FieldSpec.builder(
                        ClassName.get(className.packageName(), "TriStateOptional", "State"), "state")
                .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                .build();

        FieldSpec valueField = FieldSpec.builder(typeVariable, "value")
                .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                .build();

        MethodSpec constructor = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PRIVATE)
                .addParameter(ClassName.get(className.packageName(), "TriStateOptional", "State"), "state")
                .addParameter(typeVariable, "value")
                .addStatement("this.state = state")
                .addStatement("this.value = value")
                .build();

        MethodSpec absent = MethodSpec.methodBuilder("absent")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addTypeVariable(typeVariable)
                .returns(ParameterizedTypeName.get(className, typeVariable))
                .addJavadoc("Creates an absent TriStateOptional (field not present).\n")
                .addStatement(
                        "return new $T<>($T.ABSENT, null)",
                        className,
                        ClassName.get(className.packageName(), "TriStateOptional", "State"))
                .build();

        MethodSpec ofNull = MethodSpec.methodBuilder("ofNull")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addTypeVariable(typeVariable)
                .returns(ParameterizedTypeName.get(className, typeVariable))
                .addJavadoc("Creates a null TriStateOptional (field explicitly set to null).\n")
                .addStatement(
                        "return new $T<>($T.NULL, null)",
                        className,
                        ClassName.get(className.packageName(), "TriStateOptional", "State"))
                .build();

        MethodSpec of = MethodSpec.methodBuilder("of")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addTypeVariable(typeVariable)
                .returns(ParameterizedTypeName.get(className, typeVariable))
                .addParameter(typeVariable, "value")
                .addJavadoc("Creates a TriStateOptional with a value.\n")
                .addStatement("$T.requireNonNull(value, $S)", Objects.class, "Use ofNull() for null values")
                .addStatement(
                        "return new $T<>($T.PRESENT, value)",
                        className,
                        ClassName.get(className.packageName(), "TriStateOptional", "State"))
                .build();

        MethodSpec ofNullable = MethodSpec.methodBuilder("ofNullable")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addTypeVariable(typeVariable)
                .returns(ParameterizedTypeName.get(className, typeVariable))
                .addParameter(typeVariable, "value")
                .addAnnotation(ClassName.get("com.fasterxml.jackson.annotation", "JsonCreator"))
                .addJavadoc("Creates a TriStateOptional from a nullable value.\n")
                .addStatement("return value == null ? ofNull() : of(value)")
                .build();

        MethodSpec isAbsent = MethodSpec.methodBuilder("isAbsent")
                .addModifiers(Modifier.PUBLIC)
                .returns(boolean.class)
                .addJavadoc("Returns true if the field was absent from the request.\n")
                .addStatement(
                        "return state == $T.ABSENT",
                        ClassName.get(className.packageName(), "TriStateOptional", "State"))
                .build();

        MethodSpec isNull = MethodSpec.methodBuilder("isNull")
                .addModifiers(Modifier.PUBLIC)
                .returns(boolean.class)
                .addJavadoc("Returns true if the field was explicitly set to null.\n")
                .addStatement(
                        "return state == $T.NULL", ClassName.get(className.packageName(), "TriStateOptional", "State"))
                .build();

        MethodSpec isPresent = MethodSpec.methodBuilder("isPresent")
                .addModifiers(Modifier.PUBLIC)
                .returns(boolean.class)
                .addJavadoc("Returns true if the field has a value.\n")
                .addStatement(
                        "return state == $T.PRESENT",
                        ClassName.get(className.packageName(), "TriStateOptional", "State"))
                .build();

        MethodSpec wasSpecified = MethodSpec.methodBuilder("wasSpecified")
                .addModifiers(Modifier.PUBLIC)
                .returns(boolean.class)
                .addJavadoc("Returns true if the field was present in the request (either null or with a value).\n")
                .addStatement(
                        "return state != $T.ABSENT",
                        ClassName.get(className.packageName(), "TriStateOptional", "State"))
                .build();

        MethodSpec get = MethodSpec.methodBuilder("get")
                .addModifiers(Modifier.PUBLIC)
                .returns(typeVariable)
                .addJavadoc("Gets the value if present, throws if absent or null.\n")
                .beginControlFlow(
                        "if (state != $T.PRESENT)", ClassName.get(className.packageName(), "TriStateOptional", "State"))
                .addStatement(
                        "throw new $T($S + state + $S)",
                        IllegalStateException.class,
                        "Cannot get value from ",
                        " TriStateOptional")
                .endControlFlow()
                .addStatement("return value")
                .build();

        MethodSpec getValueOrNull = MethodSpec.methodBuilder("getValueOrNull")
                .addModifiers(Modifier.PUBLIC)
                .returns(typeVariable)
                .addJavadoc("Gets the value if present or explicitly null, throws if absent.\n")
                .addJavadoc("This is useful for update operations where null is a valid value to set.\n")
                .beginControlFlow(
                        "if (state == $T.ABSENT)", ClassName.get(className.packageName(), "TriStateOptional", "State"))
                .addStatement("throw new $T($S)", IllegalStateException.class, "No value set")
                .endControlFlow()
                .addStatement("return value")
                .build();

        MethodSpec orElse = MethodSpec.methodBuilder("orElse")
                .addModifiers(Modifier.PUBLIC)
                .returns(typeVariable)
                .addParameter(typeVariable, "defaultValue")
                .addJavadoc(
                        "Gets the value if present, returns null if explicitly set to null, or returns the provided default if absent.\n")
                .beginControlFlow(
                        "if (state == $T.PRESENT)", ClassName.get(className.packageName(), "TriStateOptional", "State"))
                .addStatement("return value")
                .endControlFlow()
                .beginControlFlow(
                        "if (state == $T.NULL)", ClassName.get(className.packageName(), "TriStateOptional", "State"))
                .addStatement("return null")
                .endControlFlow()
                .addStatement("return defaultValue")
                .build();

        MethodSpec toOptional = MethodSpec.methodBuilder("toOptional")
                .addModifiers(Modifier.PUBLIC)
                .returns(ParameterizedTypeName.get(ClassName.get(Optional.class), typeVariable))
                .addJavadoc("Converts to an Optional, returning empty for both absent and null states.\n")
                .addStatement(
                        "return state == $T.PRESENT ? $T.of(value) : $T.empty()",
                        ClassName.get(className.packageName(), "TriStateOptional", "State"),
                        Optional.class,
                        Optional.class)
                .build();

        MethodSpec getJsonValue = MethodSpec.methodBuilder("getJsonValue")
                .addModifiers(Modifier.PUBLIC)
                .returns(Object.class)
                .addAnnotation(ClassName.get("com.fasterxml.jackson.annotation", "JsonValue"))
                .addJavadoc("For JSON serialization - serialize the actual value or null.\n")
                .addJavadoc("Absent values should be handled by @JsonInclude(JsonInclude.Include.CUSTOM)\n")
                .beginControlFlow(
                        "if (state == $T.ABSENT)", ClassName.get(className.packageName(), "TriStateOptional", "State"))
                .addComment("Should not be serialized - handled by custom inclusion")
                .addStatement("throw new $T($S)", IllegalStateException.class, "Absent values should not be serialized")
                .endControlFlow()
                .addStatement(
                        "return state == $T.NULL ? null : value",
                        ClassName.get(className.packageName(), "TriStateOptional", "State"))
                .build();

        TypeSpec jsonMergePatchSpec = TypeSpec.classBuilder("TriStateOptional")
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addTypeVariable(typeVariable)
                .addJavadoc(CodeBlock.builder()
                        .add("A tri-state wrapper type that distinguishes between:\n")
                        .add("- ABSENT: field not present (e.g., not included in request)\n")
                        .add("- NULL: field explicitly set to null\n")
                        .add("- PRESENT: field has a non-null value\n")
                        .add("\n")
                        .add("This is useful for partial updates, JSON Merge Patch (RFC 7396), and any API\n")
                        .add("that needs to differentiate between \"not specified\" and \"set to null\".\n")
                        .build())
                .addType(stateEnum)
                .addField(stateField)
                .addField(valueField)
                .addMethod(constructor)
                .addMethod(absent)
                .addMethod(ofNull)
                .addMethod(of)
                .addMethod(ofNullable)
                .addMethod(isAbsent)
                .addMethod(isNull)
                .addMethod(isPresent)
                .addMethod(wasSpecified)
                .addMethod(get)
                .addMethod(getValueOrNull)
                .addMethod(orElse)
                .addMethod(toOptional)
                .addMethod(getJsonValue)
                .addMethod(createEquals())
                .addMethod(createHashCode())
                .addMethod(createToString())
                .build();

        JavaFile javaFile = JavaFile.builder(className.packageName(), jsonMergePatchSpec)
                .skipJavaLangImports(true)
                .addStaticImport(Objects.class, "requireNonNull")
                .build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }

    private MethodSpec createEquals() {
        return MethodSpec.methodBuilder("equals")
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(boolean.class)
                .addParameter(Object.class, "o")
                .beginControlFlow("if (this == o)")
                .addStatement("return true")
                .endControlFlow()
                .beginControlFlow("if (o == null || getClass() != o.getClass())")
                .addStatement("return false")
                .endControlFlow()
                .addStatement("$T<?> that = ($T<?>) o", className, className)
                .addStatement("return state == that.state && $T.equals(value, that.value)", Objects.class)
                .build();
    }

    private MethodSpec createHashCode() {
        return MethodSpec.methodBuilder("hashCode")
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(int.class)
                .addStatement("return $T.hash(state, value)", Objects.class)
                .build();
    }

    private MethodSpec createToString() {
        return MethodSpec.methodBuilder("toString")
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(String.class)
                .beginControlFlow("switch (state)")
                .addStatement("case ABSENT: return $S", "TriStateOptional.absent()")
                .addStatement("case NULL: return $S", "TriStateOptional.ofNull()")
                .addStatement("case PRESENT: return $S + value + $S", "TriStateOptional.of(", ")")
                .addStatement("default: throw new $T($S + state)", IllegalStateException.class, "Unknown state: ")
                .endControlFlow()
                .build();
    }
}
