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

import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.codegen.GeneratedAlias;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameConstants;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.immutables.AliasImmutablesStyle;
import com.fern.model.codegen.Generator;
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
import java.util.List;
import javax.lang.model.element.Modifier;
import org.immutables.value.Value;

public final class AliasGenerator extends Generator {

    private static final String IMMUTABLES_VALUE_PROPERTY_NAME = "value";

    private static final String VALUE_OF_METHOD_NAME = "valueOf";

    private final AliasTypeDeclaration aliasTypeDeclaration;
    private final DeclaredTypeName declaredTypeName;
    private final ClassName generatedAliasClassName;
    private final ClassName generatedAliasImmutablesClassName;

    public AliasGenerator(
            AliasTypeDeclaration aliasTypeDeclaration,
            PackageType packageType,
            DeclaredTypeName declaredTypeName,
            GeneratorContext generatorContext) {
        super(generatorContext, packageType);
        this.aliasTypeDeclaration = aliasTypeDeclaration;
        this.declaredTypeName = declaredTypeName;
        this.generatedAliasClassName =
                generatorContext.getClassNameUtils().getClassNameFromDeclaredTypeName(declaredTypeName, packageType);
        this.generatedAliasImmutablesClassName =
                generatorContext.getImmutablesUtils().getImmutablesClassName(generatedAliasClassName);
    }

    @Override
    public GeneratedAlias generate() {
        TypeSpec.Builder aliasTypeSpecBuilder = TypeSpec.classBuilder(generatedAliasClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .addAnnotations(getAnnotationSpecs());
        TypeSpec aliasTypeSpec;
        if (aliasTypeDeclaration.aliasOf().isVoid()) {
            aliasTypeSpec = aliasTypeSpecBuilder.addMethod(getValueOfMethod()).build();
        } else {
            TypeName aliasTypeName = generatorContext
                    .getClassNameUtils()
                    .getTypeNameFromTypeReference(true, aliasTypeDeclaration.aliasOf());
            aliasTypeSpec = aliasTypeSpecBuilder
                    .addMethod(getImmutablesValueProperty(aliasTypeName))
                    .addMethod(getValueOfMethod(aliasTypeName))
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

    private List<AnnotationSpec> getAnnotationSpecs() {
        return List.of(
                AnnotationSpec.builder(Value.Immutable.class).build(),
                AnnotationSpec.builder(ClassName.get(AliasImmutablesStyle.class))
                        .build(),
                AnnotationSpec.builder(JsonDeserialize.class)
                        .addMember("as", "$T.class", generatedAliasImmutablesClassName)
                        .build());
    }

    private MethodSpec getImmutablesValueProperty(TypeName aliasTypeName) {
        return MethodSpec.methodBuilder(IMMUTABLES_VALUE_PROPERTY_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .addAnnotation(JsonValue.class)
                .returns(aliasTypeName)
                .build();
    }

    private MethodSpec getValueOfMethod(TypeName aliasTypeName) {
        return MethodSpec.methodBuilder(VALUE_OF_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addParameter(aliasTypeName, "value")
                .addStatement("return $T.of($L)", generatedAliasImmutablesClassName, "value")
                .returns(generatedAliasClassName)
                .build();
    }

    private MethodSpec getValueOfMethod() {
        return MethodSpec.methodBuilder(VALUE_OF_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addStatement("return $T.of()", generatedAliasImmutablesClassName)
                .returns(generatedAliasClassName)
                .build();
    }

    private MethodSpec getToStringMethod() {
        CodeBlock toStringMethodCodeBlock;
        if (aliasTypeDeclaration.aliasOf().isPrimitive()) {
            toStringMethodCodeBlock =
                    aliasTypeDeclaration.aliasOf().getPrimitive().get().visit(ToStringMethodSpecVisitor.INSTANCE);
        } else {
            toStringMethodCodeBlock = CodeBlock.of("return $L().$L()", IMMUTABLES_VALUE_PROPERTY_NAME, "toString");
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
        public CodeBlock visitINTEGER() {
            return CodeBlock.of("return $T.$L($L())", Integer.class, "toString", IMMUTABLES_VALUE_PROPERTY_NAME);
        }

        @Override
        public CodeBlock visitDOUBLE() {
            return CodeBlock.of("return $T.$L($L())", Double.class, "toString", IMMUTABLES_VALUE_PROPERTY_NAME);
        }

        @Override
        public CodeBlock visitSTRING() {
            return CodeBlock.of("return $L()", IMMUTABLES_VALUE_PROPERTY_NAME);
        }

        @Override
        public CodeBlock visitBOOLEAN() {
            return CodeBlock.of("return $T.$L($L())", Boolean.class, "toString", IMMUTABLES_VALUE_PROPERTY_NAME);
        }

        @Override
        public CodeBlock visitLONG() {
            return CodeBlock.of("return $T.$L($L())", Long.class, "toString", IMMUTABLES_VALUE_PROPERTY_NAME);
        }

        @Override
        public CodeBlock visitDATE_TIME() {
            return CodeBlock.of("return $L()", IMMUTABLES_VALUE_PROPERTY_NAME);
        }

        @Override
        public CodeBlock visitUUID() {
            return CodeBlock.of("return $L().$L()", IMMUTABLES_VALUE_PROPERTY_NAME, "toString");
        }

        @Override
        public CodeBlock visitUnknown(String unknown) {
            throw new RuntimeException("Encountered unknown primitive type: " + unknown);
        }
    }
}
