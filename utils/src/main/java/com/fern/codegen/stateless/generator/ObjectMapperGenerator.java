package com.fern.codegen.stateless.generator;

import com.fasterxml.jackson.databind.DeserializationFeature;
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

    public static final String SERVER_OBJECT_MAPPERS_CLASS_NAME = "ServerObjectMappers";
    public static final String CLIENT_OBJECT_MAPPERS_CLASS_NAME = "ClientObjectMappers";
    public static final String JSON_MAPPER_FIELD_NAME = "JSON_MAPPER";

    private ObjectMapperGenerator() {}

    public static GeneratedFile generateClientObjectMappersClass(ClassNameUtils classNameUtils) {
        ClassName clientObjectMappersClassName =
                classNameUtils.getClassName(CLIENT_OBJECT_MAPPERS_CLASS_NAME, Optional.empty(), Optional.empty());
        TypeSpec serverObjectMappersTypeSpec = getObjectMappersTypeSpec(clientObjectMappersClassName, false);
        JavaFile objectMappersFile = JavaFile.builder(
                        clientObjectMappersClassName.packageName(), serverObjectMappersTypeSpec)
                .build();
        return GeneratedFile.builder()
                .file(objectMappersFile)
                .className(clientObjectMappersClassName)
                .build();
    }

    public static GeneratedFile generateServerObjectMappersClass(ClassNameUtils classNameUtils) {
        ClassName serverObjectMappersClassName =
                classNameUtils.getClassName(SERVER_OBJECT_MAPPERS_CLASS_NAME, Optional.empty(), Optional.empty());
        TypeSpec clientObjectMappersTypeSpec = getObjectMappersTypeSpec(serverObjectMappersClassName, false);
        JavaFile objectMappersFile = JavaFile.builder(
                        serverObjectMappersClassName.packageName(), clientObjectMappersTypeSpec)
                .build();
        return GeneratedFile.builder()
                .file(objectMappersFile)
                .className(serverObjectMappersClassName)
                .build();
    }

    private static TypeSpec getObjectMappersTypeSpec(ClassName className, boolean disableFailOnUnknownProperties) {
        CodeBlock.Builder jsonMapperInitializer = CodeBlock.builder()
                .add("$T.builder()\n", JsonMapper.class)
                .indent()
                .indent()
                .add(".addModule(new $T())\n", Jdk8Module.class);
        if (disableFailOnUnknownProperties) {
            jsonMapperInitializer.add(
                    ".disable($T.$L)\n",
                    DeserializationFeature.class,
                    DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES.name());
        }
        jsonMapperInitializer.add(".build()").unindent().unindent().build();
        return TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(FieldSpec.builder(
                                ObjectMapper.class,
                                JSON_MAPPER_FIELD_NAME,
                                Modifier.PUBLIC,
                                Modifier.STATIC,
                                Modifier.FINAL)
                        .initializer(jsonMapperInitializer.build())
                        .build())
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .build())
                .build();
    }
}
