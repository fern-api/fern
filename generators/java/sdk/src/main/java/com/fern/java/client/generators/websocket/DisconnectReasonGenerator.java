package com.fern.java.client.generators.websocket;

import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import javax.lang.model.element.Modifier;

/**
 * Generator for the DisconnectReason class used by WebSocket clients. Generates a top-level class in the core package
 * so it can be shared across all WebSocket channel clients.
 */
public class DisconnectReasonGenerator {

    private static final String CLASS_NAME = "DisconnectReason";

    private final String corePackageName;
    private final ClassName className;

    public DisconnectReasonGenerator(String corePackageName) {
        this.corePackageName = corePackageName;
        this.className = ClassName.get(corePackageName, CLASS_NAME);
    }

    public GeneratedJavaFile generateFile() {
        TypeSpec classSpec = TypeSpec.classBuilder(CLASS_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("Reason for WebSocket disconnection.\n")
                .addField(FieldSpec.builder(TypeName.INT, "code", Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addField(FieldSpec.builder(String.class, "reason", Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(TypeName.INT, "code")
                        .addParameter(String.class, "reason")
                        .addStatement("this.code = code")
                        .addStatement("this.reason = reason")
                        .build())
                .addMethod(MethodSpec.methodBuilder("getCode")
                        .addModifiers(Modifier.PUBLIC)
                        .returns(TypeName.INT)
                        .addStatement("return code")
                        .build())
                .addMethod(MethodSpec.methodBuilder("getReason")
                        .addModifiers(Modifier.PUBLIC)
                        .returns(String.class)
                        .addStatement("return reason")
                        .build())
                .build();

        JavaFile javaFile = JavaFile.builder(corePackageName, classSpec)
                .skipJavaLangImports(true)
                .build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }

    public ClassName getClassName() {
        return className;
    }
}
