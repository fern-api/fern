package com.fern.java.client.generators.websocket;

import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.TypeSpec;
import javax.lang.model.element.Modifier;

/**
 * Generator for the WebSocketReadyState enum used by WebSocket clients. Generates a top-level enum in the core package
 * so it can be shared across all WebSocket channel clients.
 */
public class WebSocketReadyStateGenerator {

    private static final String CLASS_NAME = "WebSocketReadyState";

    private final String corePackageName;
    private final ClassName className;

    public WebSocketReadyStateGenerator(String corePackageName) {
        this.corePackageName = corePackageName;
        this.className = ClassName.get(corePackageName, CLASS_NAME);
    }

    public GeneratedJavaFile generateFile() {
        TypeSpec enumSpec = TypeSpec.enumBuilder(CLASS_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("WebSocket connection ready state, based on the W3C WebSocket API.\n")
                .addEnumConstant(
                        "CONNECTING",
                        TypeSpec.anonymousClassBuilder("")
                                .addJavadoc("The connection is being established.\n")
                                .build())
                .addEnumConstant(
                        "OPEN",
                        TypeSpec.anonymousClassBuilder("")
                                .addJavadoc("The connection is open and ready to communicate.\n")
                                .build())
                .addEnumConstant(
                        "CLOSING",
                        TypeSpec.anonymousClassBuilder("")
                                .addJavadoc("The connection is in the process of closing.\n")
                                .build())
                .addEnumConstant(
                        "CLOSED",
                        TypeSpec.anonymousClassBuilder("")
                                .addJavadoc("The connection is closed.\n")
                                .build())
                .build();

        JavaFile javaFile = JavaFile.builder(corePackageName, enumSpec)
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
