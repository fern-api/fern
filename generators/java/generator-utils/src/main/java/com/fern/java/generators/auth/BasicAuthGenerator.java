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
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.lang.model.element.Modifier;

public final class BasicAuthGenerator extends AbstractFileGenerator {

    private static final String TOKEN_FIELD_NAME = "token";
    private static final String USERNAME_FIELD_NAME = "username";
    private static final String PASSWORD_FIELD_NAME = "password";
    private static final String GET_TOKEN_METHOD_NAME = "getToken";
    private static final String DECODE_METHOD_NAME = "decode";

    public BasicAuthGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName("BasicAuth"), generatorContext);
    }

    @Override
    public GeneratedJavaFile generateFile() {
        TypeSpec basicAuthTypeSpec = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(FieldSpec.builder(String.class, TOKEN_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addField(FieldSpec.builder(String.class, USERNAME_FIELD_NAME, Modifier.PRIVATE)
                        .initializer("null")
                        .build())
                .addField(FieldSpec.builder(String.class, PASSWORD_FIELD_NAME, Modifier.PRIVATE)
                        .initializer("null")
                        .build())
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .addParameter(String.class, TOKEN_FIELD_NAME)
                        .addStatement("this.$L = $L", TOKEN_FIELD_NAME, TOKEN_FIELD_NAME)
                        .build())
                .addMethod(MethodSpec.methodBuilder(GET_TOKEN_METHOD_NAME)
                        .addModifiers(Modifier.PUBLIC)
                        .addAnnotation(JsonValue.class)
                        .returns(String.class)
                        .addStatement("return this.$L", TOKEN_FIELD_NAME)
                        .build())
                .addMethod(MethodSpec.methodBuilder(USERNAME_FIELD_NAME)
                        .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                        .returns(String.class)
                        .addStatement("$L()", DECODE_METHOD_NAME)
                        .addStatement("return this.$L", USERNAME_FIELD_NAME)
                        .build())
                .addMethod(MethodSpec.methodBuilder(PASSWORD_FIELD_NAME)
                        .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                        .returns(String.class)
                        .addStatement("$L()", DECODE_METHOD_NAME)
                        .addStatement("return this.$L", PASSWORD_FIELD_NAME)
                        .build())
                .addMethod(MethodSpec.methodBuilder(DECODE_METHOD_NAME)
                        .beginControlFlow(
                                "if (this.$L == null || this.$L == null)", USERNAME_FIELD_NAME, PASSWORD_FIELD_NAME)
                        .addStatement(
                                "$T[] $L = $T.getDecoder().decode($L())",
                                byte.class,
                                "decodedToken",
                                Base64.class,
                                GET_TOKEN_METHOD_NAME)
                        .addStatement(
                                "$T $L = new String($L, $T.$L)",
                                String.class,
                                "credentials",
                                "decodedToken",
                                StandardCharsets.class,
                                "UTF_8")
                        .addStatement("String[] values = credentials.split(\":\", 2)")
                        .beginControlFlow("if (values.length != 2)")
                        .addStatement("throw new $T($S)", IllegalStateException.class, "Failed to decode basic token")
                        .endControlFlow()
                        .addStatement("this.$L = values[0]", USERNAME_FIELD_NAME)
                        .addStatement("this.$L = values[1]", PASSWORD_FIELD_NAME)
                        .endControlFlow()
                        .build())
                .addMethod(MethodSpec.methodBuilder("toString")
                        .addAnnotation(ClassName.get("", "java.lang.Override"))
                        .addModifiers(Modifier.PUBLIC)
                        .returns(String.class)
                        .addStatement("return $S", "BasicAuth{credentials=[REDACTED]}")
                        .build())
                .addMethod(MethodSpec.methodBuilder("of")
                        .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                        .addParameter(String.class, USERNAME_FIELD_NAME)
                        .addParameter(String.class, PASSWORD_FIELD_NAME)
                        .returns(className)
                        .addStatement(
                                "String unencodedToken = $L + \":\" + $L", USERNAME_FIELD_NAME, PASSWORD_FIELD_NAME)
                        .addStatement(
                                "return new $T($T.getEncoder().encodeToString(unencodedToken.getBytes()))",
                                className,
                                Base64.class)
                        .build())
                .build();
        JavaFile basicAuthJavaFile =
                JavaFile.builder(className.packageName(), basicAuthTypeSpec).build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(basicAuthJavaFile)
                .build();
    }
}
