package com.fern.codegen.stateless.generator;

import com.fasterxml.jackson.annotation.JsonValue;
import com.fern.codegen.GeneratedFile;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.codegen.utils.ImmutablesUtils;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.Optional;
import javax.lang.model.element.Modifier;
import org.immutables.value.Value;

public final class AuthHeaderGenerator {

    private static final String AUTH_HEADER_CLASS_NAME = "AuthHeader";

    private AuthHeaderGenerator() {}

    public static GeneratedFile generateAuthHeaderClass(
            ClassNameUtils classNameUtils, ImmutablesUtils immutablesUtils, ClassName packagePrivateImmutablesStyle) {
        ClassName authHeaderClassName = classNameUtils.getClassName(
                AUTH_HEADER_CLASS_NAME, Optional.empty(), Optional.empty(), Optional.empty());
        TypeSpec authHeaderTypeSpec = TypeSpec.classBuilder(authHeaderClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .addAnnotation(AnnotationSpec.builder(Value.Immutable.class).build())
                .addAnnotation(
                        AnnotationSpec.builder(packagePrivateImmutablesStyle).build())
                .addMethod(MethodSpec.methodBuilder("authHeader")
                        .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                        .returns(ClassNameUtils.STRING_CLASS_NAME)
                        .addAnnotation(Value.Parameter.class)
                        .addAnnotation(JsonValue.class)
                        .build())
                .addMethod(MethodSpec.methodBuilder("valueOf")
                        .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                        .addParameter(ClassNameUtils.STRING_CLASS_NAME, "authHeader")
                        .returns(authHeaderClassName)
                        .beginControlFlow("if (authHeader.startsWith(\"Bearer \"))")
                        .addStatement(
                                "return $T.of(authHeader)", immutablesUtils.getImmutablesClassName(authHeaderClassName))
                        .endControlFlow()
                        .addStatement(
                                "return $T.of(\"Bearer \" + authHeader)",
                                immutablesUtils.getImmutablesClassName(authHeaderClassName))
                        .build())
                .addMethod(MethodSpec.methodBuilder("toString")
                        .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                        .returns(ClassNameUtils.STRING_CLASS_NAME)
                        .addStatement("return authHeader()")
                        .addAnnotation(Override.class)
                        .build())
                .build();
        JavaFile authHeaderFile = JavaFile.builder(authHeaderClassName.packageName(), authHeaderTypeSpec)
                .build();
        return GeneratedFile.builder()
                .file(authHeaderFile)
                .className(authHeaderClassName)
                .build();
    }
}
