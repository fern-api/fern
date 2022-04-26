package com.fern.services.jersey.codegen;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fern.codegen.GeneratedFile;
import com.fern.codegen.utils.ClassNameUtils;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.Optional;
import javax.lang.model.element.Modifier;

public final class ObjectMapperGenerator {

    public static final String OBJECT_MAPPERS_CLASS_NAME = "ObjectMappers";
    public static final String JSON_MAPPER_FIELD_NAME = "JSON_MAPPER";

    private ObjectMapperGenerator() {}

    public static GeneratedFile generateObjectMappersClass(ClassNameUtils classNameUtils) {
        ClassName stagedBuilderClassName =
                classNameUtils.getClassName(OBJECT_MAPPERS_CLASS_NAME, Optional.empty(), Optional.empty());
        TypeSpec stagedBuilderTypeSpec = TypeSpec.classBuilder(stagedBuilderClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(FieldSpec.builder(
                                ObjectMapper.class,
                                JSON_MAPPER_FIELD_NAME,
                                Modifier.PUBLIC,
                                Modifier.STATIC,
                                Modifier.FINAL)
                        .initializer(CodeBlock.builder()
                                .add("$T.builder()\n", JsonMapper.class)
                                .indent()
                                .indent()
                                .add(".addModule(new $T())\n", Jdk8Module.class)
                                .add(".build()")
                                .unindent()
                                .unindent()
                                .build())
                        .build())
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .build())
                .build();
        JavaFile stagedBuilderFile = JavaFile.builder(stagedBuilderClassName.packageName(), stagedBuilderTypeSpec)
                .build();
        return GeneratedFile.builder()
                .file(stagedBuilderFile)
                .className(stagedBuilderClassName)
                .build();
    }
}
