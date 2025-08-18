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

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.utils.JavaDocUtils;
import com.fern.java.utils.KeyWordUtils;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import javax.lang.model.element.Modifier;

/**
 * Generates object classes for JSON Merge Patch request bodies. Uses OptionalNullable wrapper for optional<nullable<T>>
 * types and Optional for optional<T> types.
 */
public final class MergePatchObjectGenerator extends AbstractFileGenerator {

    private final ClassName optionalNullableClassName;
    private final ObjectTypeDeclaration objectTypeDeclaration;

    public MergePatchObjectGenerator(
            ObjectTypeDeclaration objectTypeDeclaration,
            ClassName className,
            AbstractGeneratorContext<?, ?> generatorContext) {
        super(className, generatorContext);
        this.objectTypeDeclaration = objectTypeDeclaration;
        this.optionalNullableClassName =
                generatorContext.getPoetClassNameFactory().getCoreClassName("OptionalNullable");
    }

    @Override
    public GeneratedJavaFile generateFile() {
        TypeSpec.Builder classBuilder = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addAnnotation(AnnotationSpec.builder(JsonDeserialize.class)
                        .addMember("builder", "$T.Builder.class", className)
                        .build());

        // Add fields
        List<FieldSpec> fields = new ArrayList<>();
        for (ObjectProperty property : objectTypeDeclaration.getProperties()) {
            TypeName fieldType = getFieldType(property);
            String fieldName = KeyWordUtils.getKeyWordCompatibleName(
                    property.getName().getName().getCamelCase().getUnsafeName());

            FieldSpec field = FieldSpec.builder(fieldType, fieldName)
                    .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                    .build();
            fields.add(field);
            classBuilder.addField(field);
        }

        // Add constructor
        MethodSpec constructor = createConstructor(fields);
        classBuilder.addMethod(constructor);

        // Add getters
        for (ObjectProperty property : objectTypeDeclaration.getProperties()) {
            classBuilder.addMethod(createGetter(property));
        }

        // Add equals, hashCode, toString
        classBuilder.addMethod(createEquals());
        classBuilder.addMethod(createHashCode(fields));
        classBuilder.addMethod(createToString());

        // Add builder
        classBuilder.addMethod(createBuilderMethod());
        classBuilder.addType(createBuilderClass());

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(JavaFile.builder(className.packageName(), classBuilder.build())
                        .build())
                .build();
    }

    private TypeName getFieldType(ObjectProperty property) {
        TypeReference valueType = property.getValueType();

        // For JSON Merge Patch, we need to handle:
        // 1. nullable<T> -> OptionalNullable<T> (can be absent, present, or null)
        // 2. optional<nullable<T>> -> OptionalNullable<T> (can be absent, present, or
        // null)
        // 3. optional<T> -> Optional<T> (can be absent or present, but not null)
        // 4. T -> T (required, must be present)

        // Check if the field is nullable or optional<nullable<T>>
        boolean needsOptionalNullable = valueType.visit(new TypeReference.Visitor<Boolean>() {
            @Override
            public Boolean visitContainer(ContainerType containerType) {
                return containerType.visit(new ContainerType.Visitor<Boolean>() {
                    @Override
                    public Boolean visitOptional(TypeReference inner) {
                        // Check if the inner type is nullable
                        return inner.visit(new TypeReference.Visitor<Boolean>() {
                            @Override
                            public Boolean visitContainer(ContainerType innerContainer) {
                                return innerContainer.visit(new ContainerType.Visitor<Boolean>() {
                                    @Override
                                    public Boolean visitNullable(TypeReference innerInner) {
                                        return true; // optional<nullable<T>>
                                    }

                                    @Override
                                    public Boolean visitList(TypeReference typeReference) {
                                        return false;
                                    }

                                    @Override
                                    public Boolean visitSet(TypeReference typeReference) {
                                        return false;
                                    }

                                    @Override
                                    public Boolean visitMap(com.fern.ir.model.types.MapType mapType) {
                                        return false;
                                    }

                                    @Override
                                    public Boolean visitOptional(TypeReference typeReference) {
                                        return false;
                                    }

                                    @Override
                                    public Boolean visitLiteral(com.fern.ir.model.types.Literal literal) {
                                        return false;
                                    }

                                    @Override
                                    public Boolean _visitUnknown(Object unknown) {
                                        return false;
                                    }
                                });
                            }

                            @Override
                            public Boolean visitNamed(com.fern.ir.model.types.NamedType namedType) {
                                return false;
                            }

                            @Override
                            public Boolean visitPrimitive(com.fern.ir.model.types.PrimitiveType primitiveType) {
                                return false;
                            }

                            @Override
                            public Boolean visitUnknown() {
                                return false;
                            }

                            @Override
                            public Boolean _visitUnknown(Object unknown) {
                                return false;
                            }
                        });
                    }

                    @Override
                    public Boolean visitNullable(TypeReference typeReference) {
                        return true; // nullable<T> in merge-patch context needs OptionalNullable
                    }

                    @Override
                    public Boolean visitList(TypeReference typeReference) {
                        return false;
                    }

                    @Override
                    public Boolean visitSet(TypeReference typeReference) {
                        return false;
                    }

                    @Override
                    public Boolean visitMap(com.fern.ir.model.types.MapType mapType) {
                        return false;
                    }

                    @Override
                    public Boolean visitLiteral(com.fern.ir.model.types.Literal literal) {
                        return false;
                    }

                    @Override
                    public Boolean _visitUnknown(Object unknown) {
                        return false;
                    }
                });
            }

            @Override
            public Boolean visitNamed(com.fern.ir.model.types.NamedType namedType) {
                return false;
            }

            @Override
            public Boolean visitPrimitive(com.fern.ir.model.types.PrimitiveType primitiveType) {
                return false;
            }

            @Override
            public Boolean visitUnknown() {
                return false;
            }

            @Override
            public Boolean _visitUnknown(Object unknown) {
                return false;
            }
        });

        if (needsOptionalNullable) {
            // For nullable<T> or optional<nullable<T>>, use OptionalNullable wrapper
            TypeName innerType = extractFromNullable(valueType);
            return ParameterizedTypeName.get(optionalNullableClassName, innerType);
        } else {
            // For optional<T> (not nullable) or required fields, use normal type mapping
            // The PoetTypeNameMapper will handle Optional<T> for optional fields
            return generatorContext.getPoetTypeNameMapper().convertToTypeName(false, valueType);
        }
    }

    private TypeName extractFromNullable(TypeReference typeReference) {
        // Extract the inner type T from nullable<T> or optional<nullable<T>>
        return typeReference.visit(new TypeReference.Visitor<TypeName>() {
            @Override
            public TypeName visitContainer(ContainerType containerType) {
                return containerType.visit(new ContainerType.Visitor<TypeName>() {
                    @Override
                    public TypeName visitOptional(TypeReference inner) {
                        // Extract from optional<nullable<T>>
                        return inner.visit(new TypeReference.Visitor<TypeName>() {
                            @Override
                            public TypeName visitContainer(ContainerType innerContainer) {
                                return innerContainer.visit(new ContainerType.Visitor<TypeName>() {
                                    @Override
                                    public TypeName visitNullable(TypeReference innerInner) {
                                        // Return the actual type T from optional<nullable<T>>
                                        return generatorContext
                                                .getPoetTypeNameMapper()
                                                .convertToTypeName(false, innerInner);
                                    }

                                    @Override
                                    public TypeName visitList(TypeReference typeReference) {
                                        return generatorContext
                                                .getPoetTypeNameMapper()
                                                .convertToTypeName(false, typeReference);
                                    }

                                    @Override
                                    public TypeName visitSet(TypeReference typeReference) {
                                        return generatorContext
                                                .getPoetTypeNameMapper()
                                                .convertToTypeName(false, typeReference);
                                    }

                                    @Override
                                    public TypeName visitMap(com.fern.ir.model.types.MapType mapType) {
                                        return generatorContext
                                                .getPoetTypeNameMapper()
                                                .convertToTypeName(
                                                        false, TypeReference.container(ContainerType.map(mapType)));
                                    }

                                    @Override
                                    public TypeName visitOptional(TypeReference typeReference) {
                                        return generatorContext
                                                .getPoetTypeNameMapper()
                                                .convertToTypeName(false, typeReference);
                                    }

                                    @Override
                                    public TypeName visitLiteral(com.fern.ir.model.types.Literal literal) {
                                        return ClassName.get(String.class);
                                    }

                                    @Override
                                    public TypeName _visitUnknown(Object unknown) {
                                        return ClassName.get(Object.class);
                                    }
                                });
                            }

                            @Override
                            public TypeName visitNamed(com.fern.ir.model.types.NamedType namedType) {
                                return generatorContext.getPoetTypeNameMapper().convertToTypeName(false, inner);
                            }

                            @Override
                            public TypeName visitPrimitive(com.fern.ir.model.types.PrimitiveType primitiveType) {
                                return generatorContext.getPoetTypeNameMapper().convertToTypeName(false, inner);
                            }

                            @Override
                            public TypeName visitUnknown() {
                                return ClassName.get(Object.class);
                            }

                            @Override
                            public TypeName _visitUnknown(Object unknown) {
                                return ClassName.get(Object.class);
                            }
                        });
                    }

                    @Override
                    public TypeName visitNullable(TypeReference inner) {
                        // Direct nullable<T> case - extract the inner type T
                        return generatorContext.getPoetTypeNameMapper().convertToTypeName(false, inner);
                    }

                    @Override
                    public TypeName visitList(TypeReference typeReference) {
                        return generatorContext.getPoetTypeNameMapper().convertToTypeName(false, typeReference);
                    }

                    @Override
                    public TypeName visitSet(TypeReference typeReference) {
                        return generatorContext.getPoetTypeNameMapper().convertToTypeName(false, typeReference);
                    }

                    @Override
                    public TypeName visitMap(com.fern.ir.model.types.MapType mapType) {
                        return generatorContext
                                .getPoetTypeNameMapper()
                                .convertToTypeName(false, TypeReference.container(ContainerType.map(mapType)));
                    }

                    @Override
                    public TypeName visitLiteral(com.fern.ir.model.types.Literal literal) {
                        return ClassName.get(String.class);
                    }

                    @Override
                    public TypeName _visitUnknown(Object unknown) {
                        return ClassName.get(Object.class);
                    }
                });
            }

            @Override
            public TypeName visitNamed(com.fern.ir.model.types.NamedType namedType) {
                return generatorContext.getPoetTypeNameMapper().convertToTypeName(false, typeReference);
            }

            @Override
            public TypeName visitPrimitive(com.fern.ir.model.types.PrimitiveType primitiveType) {
                return generatorContext.getPoetTypeNameMapper().convertToTypeName(false, typeReference);
            }

            @Override
            public TypeName visitUnknown() {
                return ClassName.get(Object.class);
            }

            @Override
            public TypeName _visitUnknown(Object unknown) {
                return ClassName.get(Object.class);
            }
        });
    }

    private MethodSpec createConstructor(List<FieldSpec> fields) {
        MethodSpec.Builder constructor = MethodSpec.constructorBuilder().addModifiers(Modifier.PRIVATE);

        for (FieldSpec field : fields) {
            constructor.addParameter(field.type, field.name);
            constructor.addStatement("this.$N = $N", field.name, field.name);
        }

        return constructor.build();
    }

    private MethodSpec createGetter(ObjectProperty property) {
        String fieldName = KeyWordUtils.getKeyWordCompatibleName(
                property.getName().getName().getCamelCase().getUnsafeName());
        String methodName = KeyWordUtils.getKeyWordCompatibleMethodName(
                "get" + property.getName().getName().getPascalCase().getUnsafeName());
        TypeName returnType = getFieldType(property);

        MethodSpec.Builder getter = MethodSpec.methodBuilder(methodName)
                .addModifiers(Modifier.PUBLIC)
                .returns(returnType)
                .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                        .addMember("value", "$S", property.getName().getWireValue())
                        .build());

        property.getDocs().ifPresent(docs -> getter.addJavadoc(JavaDocUtils.render(docs)));

        getter.addStatement("return $N", fieldName);

        return getter.build();
    }

    private MethodSpec createEquals() {
        return MethodSpec.methodBuilder("equals")
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(boolean.class)
                .addParameter(Object.class, "other")
                .beginControlFlow("if (this == other)")
                .addStatement("return true")
                .endControlFlow()
                .beginControlFlow("if (other == null || getClass() != other.getClass())")
                .addStatement("return false")
                .endControlFlow()
                .addStatement("$T that = ($T) other", className, className)
                .addStatement(
                        "return java.util.Objects.equals(this.$N, that.$N)",
                        objectTypeDeclaration
                                .getProperties()
                                .get(0)
                                .getName()
                                .getName()
                                .getCamelCase()
                                .getUnsafeName(),
                        objectTypeDeclaration
                                .getProperties()
                                .get(0)
                                .getName()
                                .getName()
                                .getCamelCase()
                                .getUnsafeName())
                .build();
    }

    private MethodSpec createHashCode(List<FieldSpec> fields) {
        MethodSpec.Builder hashCode = MethodSpec.methodBuilder("hashCode")
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(int.class);

        if (!fields.isEmpty()) {
            CodeBlock.Builder codeBlock = CodeBlock.builder().add("return java.util.Objects.hash(");
            for (int i = 0; i < fields.size(); i++) {
                if (i > 0) codeBlock.add(", ");
                codeBlock.add("this.$N", fields.get(i).name);
            }
            codeBlock.add(")");
            hashCode.addStatement(codeBlock.build());
        } else {
            hashCode.addStatement("return 0");
        }

        return hashCode.build();
    }

    private MethodSpec createToString() {
        return MethodSpec.methodBuilder("toString")
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(String.class)
                .addStatement(
                        "return $T.stringify(this)",
                        generatorContext.getPoetClassNameFactory().getObjectMapperClassName())
                .build();
    }

    private MethodSpec createBuilderMethod() {
        return MethodSpec.methodBuilder("builder")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(ClassName.get(className.packageName(), className.simpleName(), "Builder"))
                .addStatement("return new Builder()")
                .build();
    }

    private TypeSpec createBuilderClass() {
        TypeSpec.Builder builder = TypeSpec.classBuilder("Builder")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                .addAnnotation(AnnotationSpec.builder(JsonIgnoreProperties.class)
                        .addMember("ignoreUnknown", "true")
                        .build());

        // Add fields
        List<FieldSpec> builderFields = new ArrayList<>();
        for (ObjectProperty property : objectTypeDeclaration.getProperties()) {
            TypeName fieldType = getFieldType(property);
            String fieldName = KeyWordUtils.getKeyWordCompatibleName(
                    property.getName().getName().getCamelCase().getUnsafeName());

            FieldSpec.Builder fieldBuilder =
                    FieldSpec.builder(fieldType, fieldName).addModifiers(Modifier.PRIVATE);

            // Initialize OptionalNullable and Optional fields
            if (fieldType instanceof ParameterizedTypeName) {
                ParameterizedTypeName paramType = (ParameterizedTypeName) fieldType;
                if (paramType.rawType.equals(optionalNullableClassName)) {
                    fieldBuilder.initializer("$T.absent()", optionalNullableClassName);
                } else if (paramType.rawType.equals(ClassName.get(Optional.class))) {
                    fieldBuilder.initializer("$T.empty()", Optional.class);
                }
            }

            FieldSpec field = fieldBuilder.build();
            builderFields.add(field);
            builder.addField(field);
        }

        // Add constructor
        builder.addMethod(
                MethodSpec.constructorBuilder().addModifiers(Modifier.PRIVATE).build());

        // Add setter methods
        for (ObjectProperty property : objectTypeDeclaration.getProperties()) {
            builder.addMethod(createBuilderSetter(property));
        }

        // Add build method
        builder.addMethod(createBuildMethod(builderFields));

        return builder.build();
    }

    private MethodSpec createBuilderSetter(ObjectProperty property) {
        String fieldName = KeyWordUtils.getKeyWordCompatibleName(
                property.getName().getName().getCamelCase().getUnsafeName());
        String setterName = fieldName;
        TypeName fieldType = getFieldType(property);

        MethodSpec.Builder setter = MethodSpec.methodBuilder(setterName)
                .addModifiers(Modifier.PUBLIC)
                .returns(ClassName.get(className.packageName(), className.simpleName(), "Builder"));

        if (fieldType instanceof ParameterizedTypeName
                && ((ParameterizedTypeName) fieldType).rawType.equals(optionalNullableClassName)) {
            TypeName innerType = ((ParameterizedTypeName) fieldType).typeArguments.get(0);

            setter.addAnnotation(AnnotationSpec.builder(JsonSetter.class)
                    .addMember("value", "$S", property.getName().getWireValue())
                    .build());

            setter.addParameter(innerType, "value");
            setter.addStatement("this.$N = $T.ofNullable(value)", fieldName, optionalNullableClassName);
        } else if (fieldType instanceof ParameterizedTypeName
                && ((ParameterizedTypeName) fieldType).rawType.equals(ClassName.get(Optional.class))) {
            TypeName innerType = ((ParameterizedTypeName) fieldType).typeArguments.get(0);

            setter.addAnnotation(AnnotationSpec.builder(JsonSetter.class)
                    .addMember("value", "$S", property.getName().getWireValue())
                    .addMember("nulls", "$T.$L", Nulls.class, "SKIP")
                    .build());

            setter.addParameter(innerType, "value");
            setter.addStatement("this.$N = $T.ofNullable(value)", fieldName, Optional.class);
        } else {
            setter.addParameter(fieldType, "value");
            setter.addStatement("this.$N = value", fieldName);
        }

        setter.addStatement("return this");

        return setter.build();
    }

    private MethodSpec createBuildMethod(List<FieldSpec> fields) {
        MethodSpec.Builder build =
                MethodSpec.methodBuilder("build").addModifiers(Modifier.PUBLIC).returns(className);

        CodeBlock.Builder params = CodeBlock.builder();
        for (int i = 0; i < fields.size(); i++) {
            if (i > 0) params.add(", ");
            params.add("$N", fields.get(i).name);
        }

        build.addStatement("return new $T($L)", className, params.build());

        return build.build();
    }
}
