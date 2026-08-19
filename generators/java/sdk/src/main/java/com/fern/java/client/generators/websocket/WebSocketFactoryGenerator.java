package com.fern.java.client.generators.websocket;

import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeSpec;
import javax.lang.model.element.Modifier;

/**
 * Generator for WebSocketFactory interface. This generates an interface that allows for pluggable WebSocket
 * implementations.
 */
public class WebSocketFactoryGenerator {

    private static final String INTERFACE_NAME = "WebSocketFactory";
    private static final String CREATE_METHOD_NAME = "create";

    private final String corePackageName;
    private final ClassName interfaceClassName;

    public WebSocketFactoryGenerator(String corePackageName) {
        this.corePackageName = corePackageName;
        this.interfaceClassName = ClassName.get(corePackageName, INTERFACE_NAME);
    }

    /** Generates the WebSocketFactory interface. */
    public GeneratedJavaFile generateInterface() {
        TypeSpec interfaceSpec = TypeSpec.interfaceBuilder(INTERFACE_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("Factory interface for creating WebSocket connections.\n"
                        + "Allows for pluggable WebSocket implementations and testing.\n")
                .addMethod(generateCreateMethod())
                .build();

        JavaFile javaFile = JavaFile.builder(corePackageName, interfaceSpec)
                .skipJavaLangImports(true)
                .build();

        return GeneratedJavaFile.builder()
                .className(interfaceClassName)
                .javaFile(javaFile)
                .build();
    }

    /** Generates the create method for the factory interface. */
    private MethodSpec generateCreateMethod() {
        return MethodSpec.methodBuilder(CREATE_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .returns(ClassName.get("okhttp3", "WebSocket"))
                .addParameter(ParameterSpec.builder(ClassName.get("okhttp3", "Request"), "request")
                        .build())
                .addParameter(ParameterSpec.builder(ClassName.get("okhttp3", "WebSocketListener"), "listener")
                        .build())
                .addJavadoc("Creates a WebSocket connection with the specified request and listener.\n"
                        + "\n"
                        + "@param request The WebSocket connection request with URL and headers\n"
                        + "@param listener The listener for WebSocket events\n"
                        + "@return A WebSocket instance ready for communication\n")
                .build();
    }

    /** Returns the class name for the generated interface. */
    public ClassName getInterfaceClassName() {
        return interfaceClassName;
    }
}
