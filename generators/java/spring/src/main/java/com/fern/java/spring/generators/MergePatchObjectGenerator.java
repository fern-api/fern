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
import javax.lang.model.element.Modifier;

/**
 * Generates object classes for JSON Merge Patch request bodies. Uses TriStateOptional wrapper instead of Optional for
 * nullable fields.
 */
public final class MergePatchObjectGenerator extends AbstractFileGenerator {

    private static final ClassName TRI_STATE_OPTIONAL = ClassName.get("core", "TriStateOptional");
    private final ObjectTypeDeclaration objectTypeDeclaration;

    public MergePatchObjectGenerator(
            ObjectTypeDeclaration objectTypeDeclaration,
            ClassName className,
            AbstractGeneratorContext<?, ?> generatorContext) {
        super(className, generatorContext);
        this.objectTypeDeclaration = objectTypeDeclaration;
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

        // Check if the field is nullable
        boolean isNullable = valueType.visit(new TypeReference.Visitor<Boolean>() {
            @Override
            public Boolean visitNamed(com.fern.ir.model.types.NamedType namedType) {
                return false;
            }

            @Override
            public Boolean visitPrimitive(com.fern.ir.model.types.PrimitiveType primitiveType) {
                return false;
            }

            @Override
            public Boolean visitContainer(ContainerType containerType) {
                return containerType.visit(new ContainerType.Visitor<Boolean>() {
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
                        return true;
                    }

                    @Override
                    public Boolean visitNullable(TypeReference typeReference) {
                        return true;
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
            public Boolean visitUnknown() {
                return false;
            }

            @Override
            public Boolean _visitUnknown(Object unknown) {
                return false;
            }
        });

        if (isNullable) {
            // For nullable fields, use TriStateOptional wrapper
            TypeName innerType = getInnerType(valueType);
            return ParameterizedTypeName.get(TRI_STATE_OPTIONAL, innerType);
        } else {
            // For required fields, use the type directly
            return generatorContext.getPoetTypeNameMapper().convertToTypeName(false, valueType);
        }
    }

    private TypeName getInnerType(TypeReference typeReference) {
        // Extract the inner type from Optional/nullable container
        return typeReference.visit(new TypeReference.Visitor<TypeName>() {
            @Override
            public TypeName visitContainer(ContainerType containerType) {
                return containerType.visit(new ContainerType.Visitor<TypeName>() {
                    @Override
                    public TypeName visitOptional(TypeReference inner) {
                        return generatorContext.getPoetTypeNameMapper().convertToTypeName(false, inner);
                    }

                    @Override
                    public TypeName visitNullable(TypeReference inner) {
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
                .addStatement("return $T.stringify(this)", ClassName.get("core", "ObjectMappers"))
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

            // Initialize TriStateOptional fields to absent
            if (fieldType instanceof ParameterizedTypeName
                    && ((ParameterizedTypeName) fieldType).rawType.equals(TRI_STATE_OPTIONAL)) {
                fieldBuilder.initializer("$T.absent()", TRI_STATE_OPTIONAL);
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

        // For TriStateOptional fields, create a special setter
        if (fieldType instanceof ParameterizedTypeName
                && ((ParameterizedTypeName) fieldType).rawType.equals(TRI_STATE_OPTIONAL)) {
            TypeName innerType = ((ParameterizedTypeName) fieldType).typeArguments.get(0);

            // Add JsonSetter annotation to handle deserialization
            setter.addAnnotation(AnnotationSpec.builder(JsonSetter.class)
                    .addMember("value", "$S", property.getName().getWireValue())
                    .build());

            // Accept the inner type and wrap in TriStateOptional
            setter.addParameter(innerType, "value");
            setter.addStatement("this.$N = $T.ofNullable(value)", fieldName, TRI_STATE_OPTIONAL);
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
