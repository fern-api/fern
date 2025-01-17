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

package com.fern.java.generators;

import com.fasterxml.jackson.annotation.JsonValue;
import com.fern.ir.model.types.EnumTypeDeclaration;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.java.AbstractGeneratorContext;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Set;
import javax.lang.model.element.Modifier;

public final class EnumGenerator extends AbstractTypeGenerator {
    private static final FieldSpec VALUE_FIELD = FieldSpec.builder(String.class, "value")
            .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
            .build();

    private final EnumTypeDeclaration enumTypeDeclaration;

    public EnumGenerator(
            ClassName className,
            AbstractGeneratorContext<?, ?> generatorContext,
            EnumTypeDeclaration enumTypeDeclaration,
            Set<String> reservedTypeNames,
            boolean isTopLevelClass) {
        super(className, generatorContext, reservedTypeNames, isTopLevelClass);
        this.enumTypeDeclaration = enumTypeDeclaration;
    }

    @Override
    public List<TypeDeclaration> getInlineTypeDeclarations() {
        return List.of();
    }

    @Override
    protected TypeSpec getTypeSpecWithoutInlineTypes() {
        if (generatorContext.getCustomConfig().enableForwardCompatibleEnum()) {
            ForwardCompatibleEnumGenerator forwardCompatibleEnumGenerator = new ForwardCompatibleEnumGenerator(
                    className, generatorContext, enumTypeDeclaration, reservedTypeNames, isTopLevelClass);
            return forwardCompatibleEnumGenerator.getTypeSpecWithoutInlineTypes();
        } else {
            TypeSpec.Builder enumTypeSpecBuilder = TypeSpec.enumBuilder(className);
            enumTypeDeclaration.getValues().forEach(enumValue -> {
                enumTypeSpecBuilder.addEnumConstant(
                        enumValue.getName().getName().getScreamingSnakeCase().getSafeName(),
                        TypeSpec.anonymousClassBuilder("$S", enumValue.getName().getWireValue())
                                .build());
            });
            enumTypeSpecBuilder
                    .addModifiers(Modifier.PUBLIC)
                    .addField(VALUE_FIELD)
                    .addMethod(MethodSpec.constructorBuilder()
                            .addParameter(VALUE_FIELD.type, VALUE_FIELD.name)
                            .addStatement("this.$L = $L", VALUE_FIELD.name, VALUE_FIELD.name)
                            .build())
                    .addMethod(MethodSpec.methodBuilder("toString")
                            .addModifiers(Modifier.PUBLIC)
                            .addAnnotation(JsonValue.class)
                            .addAnnotation(ClassName.get("", "java.lang.Override"))
                            .returns(String.class)
                            .addStatement("return this.$L", VALUE_FIELD.name)
                            .build())
                    .build();

            return enumTypeSpecBuilder.build();
        }
    }

    @Override
    public TypeSpec getTypeSpec() {
        TypeSpec typeSpec = getTypeSpecWithoutInlineTypes();
        if (generatorContext.getCustomConfig().enableInlineTypes()) {
            List<TypeSpec> inlineTypeSpecs = getInlineTypeSpecs();
            typeSpec = typeSpec.toBuilder().addTypes(inlineTypeSpecs).build();
            if (!isTopLevelClass && !generatorContext.getCustomConfig().enableForwardCompatibleEnum()) {
                typeSpec = typeSpec.toBuilder().addModifiers(Modifier.STATIC).build();
            }
        }
        return typeSpec;
    }
}
