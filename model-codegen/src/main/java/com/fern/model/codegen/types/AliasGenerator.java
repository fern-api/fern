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
package com.fern.model.codegen.types;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonCreator.Mode;
import com.fern.codegen.GeneratedAlias;
import com.fern.codegen.Generator;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameConstants;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.types.AliasTypeDeclaration;
import com.fern.types.DeclaredTypeName;
import com.fern.types.PrimitiveType;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import javax.lang.model.element.Modifier;

public final class AliasGenerator extends Generator {

    private static final String VALUE_FIELD_NAME = "value";

    private static final String OF_METHOD_NAME = "of";

    private final AliasTypeDeclaration aliasTypeDeclaration;
    private final DeclaredTypeName declaredTypeName;
    private final ClassName generatedAliasClassName;

    public AliasGenerator(
            AliasTypeDeclaration aliasTypeDeclaration,
            DeclaredTypeName declaredTypeName,
            GeneratorContext generatorContext) {
        super(generatorContext);
        this.aliasTypeDeclaration = aliasTypeDeclaration;
        this.declaredTypeName = declaredTypeName;
        this.generatedAliasClassName = generatorContext
                .getClassNameUtils()
                .getClassNameFromDeclaredTypeName(declaredTypeName, PackageType.MODEL);
    }

    @Override
    public GeneratedAlias generate() {
        TypeSpec.Builder aliasTypeSpecBuilder =
                TypeSpec.classBuilder(generatedAliasClassName).addModifiers(Modifier.PUBLIC, Modifier.FINAL);
        TypeSpec aliasTypeSpec;
        if (aliasTypeDeclaration.aliasOf().isVoid()) {
            aliasTypeSpec = aliasTypeSpecBuilder
                    .addMethod(getConstructor())
                    .addMethod(getOfMethodName())
                    .build();
        } else {
            TypeName aliasTypeName = generatorContext
                    .getClassNameUtils()
                    .getTypeNameFromTypeReference(true, aliasTypeDeclaration.aliasOf());
            aliasTypeSpec = aliasTypeSpecBuilder
                    .addField(aliasTypeName, VALUE_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                    .addMethod(getConstructor(aliasTypeName))
                    .addMethod(getOfMethodName(aliasTypeName))
                    .addMethod(getEqualsMethod(aliasTypeName))
                    .addMethod(getHashCodeMethod())
                    .addMethod(getToStringMethod())
                    .build();
        }
        JavaFile aliasFile = JavaFile.builder(generatedAliasClassName.packageName(), aliasTypeSpec)
                .build();
        return GeneratedAlias.builder()
                .file(aliasFile)
                .className(generatedAliasClassName)
                .aliasTypeDeclaration(aliasTypeDeclaration)
                .build();
    }

    private MethodSpec getConstructor(TypeName aliasTypeName) {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PRIVATE)
                .addParameter(aliasTypeName, VALUE_FIELD_NAME)
                .addStatement("this.value = value")
                .build();
    }

    private MethodSpec getConstructor() {
        return MethodSpec.constructorBuilder().addModifiers(Modifier.PRIVATE).build();
    }

    private MethodSpec getOfMethodName(TypeName aliasTypeName) {
        return MethodSpec.methodBuilder(OF_METHOD_NAME)
                .addAnnotation(AnnotationSpec.builder(JsonCreator.class)
                        .addMember(
                                "mode",
                                "$T.$L.$L",
                                JsonCreator.class,
                                JsonCreator.Mode.class.getSimpleName(),
                                Mode.DELEGATING.name())
                        .build())
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addParameter(aliasTypeName, "value")
                .addStatement("return new $T($L)", generatedAliasClassName, "value")
                .returns(generatedAliasClassName)
                .build();
    }

    private MethodSpec getOfMethodName() {
        return MethodSpec.methodBuilder(OF_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addStatement("return new $T()", generatedAliasClassName)
                .returns(generatedAliasClassName)
                .build();
    }

    private MethodSpec getEqualsMethod(TypeName aliasTypeName) {
        boolean isPrimitive = aliasTypeName.isPrimitive();
        String impl = isPrimitive
                ? "return this == other || (other instanceof $T && this.$L == (($T) other).value)"
                : "return this == other || (other instanceof $T && this.$L.equals((($T) other).value))";
        return MethodSpec.methodBuilder("equals")
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(boolean.class)
                .addParameter(Object.class, "other")
                .addStatement(impl, generatedAliasClassName, VALUE_FIELD_NAME, generatedAliasClassName)
                .build();
    }

    private MethodSpec getHashCodeMethod() {
        CodeBlock hashCodeMethodBlock;
        if (aliasTypeDeclaration.aliasOf().isPrimitive()) {
            hashCodeMethodBlock =
                    aliasTypeDeclaration.aliasOf().getPrimitive().get().visit(HashcodeMethodSpecVisitor.INSTANCE);
        } else {
            hashCodeMethodBlock = CodeBlock.of("return $L().$L()", VALUE_FIELD_NAME, "toString");
        }
        return MethodSpec.methodBuilder("hashCode")
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(int.class)
                .addStatement(hashCodeMethodBlock)
                .build();
    }

    private MethodSpec getToStringMethod() {
        CodeBlock toStringMethodCodeBlock;
        if (aliasTypeDeclaration.aliasOf().isPrimitive()) {
            toStringMethodCodeBlock =
                    aliasTypeDeclaration.aliasOf().getPrimitive().get().visit(ToStringMethodSpecVisitor.INSTANCE);
        } else {
            toStringMethodCodeBlock = CodeBlock.of("return $L().$L()", VALUE_FIELD_NAME, "toString");
        }
        return MethodSpec.methodBuilder("toString")
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Override.class)
                .addStatement(toStringMethodCodeBlock)
                .returns(ClassNameConstants.STRING_CLASS_NAME)
                .build();
    }

    private static final class ToStringMethodSpecVisitor implements PrimitiveType.Visitor<CodeBlock> {

        private static final ToStringMethodSpecVisitor INSTANCE = new ToStringMethodSpecVisitor();

        @Override
        public CodeBlock visitInteger() {
            return CodeBlock.of("return $T.$L($L)", Integer.class, "toString", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitDouble() {
            return CodeBlock.of("return $T.$L($L)", Double.class, "toString", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitString() {
            return CodeBlock.of("return $L", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitBoolean() {
            return CodeBlock.of("return $T.$L($L())", Boolean.class, "toString", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitLong() {
            return CodeBlock.of("return $T.$L($L)", Long.class, "toString", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitDateTime() {
            return CodeBlock.of("return $L", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitUuid() {
            return CodeBlock.of("return $L.$L()", VALUE_FIELD_NAME, "toString");
        }

        @Override
        public CodeBlock visitUnknown(String unknown) {
            throw new RuntimeException("Encountered unknown primitive type: " + unknown);
        }
    }

    private static final class HashcodeMethodSpecVisitor implements PrimitiveType.Visitor<CodeBlock> {

        private static final HashcodeMethodSpecVisitor INSTANCE = new HashcodeMethodSpecVisitor();

        @Override
        public CodeBlock visitInteger() {
            return CodeBlock.of("return $T.hashCode($L)", Integer.class, VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitDouble() {
            return CodeBlock.of("return $T.hashCode($L)", Double.class, VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitString() {
            return CodeBlock.of("return $L.hashCode()", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitBoolean() {
            return CodeBlock.of("return $T.hashCode($L)", Boolean.class, VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitLong() {
            return CodeBlock.of("return $L.hashCode()", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitDateTime() {
            return CodeBlock.of("return $L.hashCode()", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitUuid() {
            return CodeBlock.of("return $L.hashCode()", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitUnknown(String unknown) {
            throw new RuntimeException("Encountered unknown primitive type: " + unknown);
        }
    }
}
