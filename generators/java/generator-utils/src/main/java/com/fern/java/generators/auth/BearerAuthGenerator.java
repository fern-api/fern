package com.fern.java.generators.auth;

import com.fasterxml.jackson.annotation.JsonValue;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import javax.lang.model.element.Modifier;

public final class BearerAuthGenerator extends AbstractFileGenerator {

    private static final String TOKEN_FIELD_NAME = "token";
    private static final String GET_TOKEN_METHOD_NAME = "getToken";

    public BearerAuthGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName("BearerAuth"), generatorContext);
    }

    @Override
    public GeneratedJavaFile generateFile() {
        TypeSpec authHeaderTypeSpec = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(FieldSpec.builder(String.class, TOKEN_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .addParameter(String.class, TOKEN_FIELD_NAME)
                        .addStatement("this.$L = $L", TOKEN_FIELD_NAME, TOKEN_FIELD_NAME)
                        .build())
                .addMethod(MethodSpec.methodBuilder(GET_TOKEN_METHOD_NAME)
                        .addModifiers(Modifier.PUBLIC)
                        .returns(String.class)
                        .addAnnotation(JsonValue.class)
                        .addStatement("return $L", TOKEN_FIELD_NAME)
                        .build())
                .addMethod(MethodSpec.methodBuilder("toString")
                        .addModifiers(Modifier.PUBLIC)
                        .returns(String.class)
                        .addAnnotation(ClassName.get("", "java.lang.Override"))
                        .addStatement("return $S", "BearerAuth{token=[REDACTED]}")
                        .build())
                .addMethod(MethodSpec.methodBuilder("of")
                        .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                        .addParameter(String.class, "token")
                        .returns(className)
                        .addStatement(
                                "return new $T($L.startsWith($S) ? $L.substring(7) : token)",
                                className,
                                "token",
                                "Bearer ",
                                "token")
                        .build())
                .build();
        JavaFile authHeaderFile =
                JavaFile.builder(className.packageName(), authHeaderTypeSpec).build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(authHeaderFile)
                .build();
    }
}
