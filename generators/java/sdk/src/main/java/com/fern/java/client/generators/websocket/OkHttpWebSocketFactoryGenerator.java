package com.fern.java.client.generators.websocket;

import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeSpec;
import javax.lang.model.element.Modifier;

/**
 * Generator for OkHttpWebSocketFactory implementation. This is the default implementation that delegates to
 * OkHttpClient.
 */
public class OkHttpWebSocketFactoryGenerator {

    private static final String CLASS_NAME = "OkHttpWebSocketFactory";
    private static final String OKHTTP_CLIENT_FIELD = "okHttpClient";

    private final String corePackageName;
    private final ClassName className;
    private final ClassName factoryInterfaceName;

    public OkHttpWebSocketFactoryGenerator(String corePackageName) {
        this.corePackageName = corePackageName;
        this.className = ClassName.get(corePackageName, CLASS_NAME);
        this.factoryInterfaceName = ClassName.get(corePackageName, "WebSocketFactory");
    }

    /** Generates the OkHttpWebSocketFactory implementation. */
    public GeneratedJavaFile generateImplementation() {
        FieldSpec okHttpClientField = FieldSpec.builder(
                        ClassName.get("okhttp3", "OkHttpClient"), OKHTTP_CLIENT_FIELD, Modifier.PRIVATE, Modifier.FINAL)
                .build();

        TypeSpec classSpec = TypeSpec.classBuilder(CLASS_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addSuperinterface(factoryInterfaceName)
                .addJavadoc("Default WebSocketFactory implementation using OkHttpClient.\n"
                        + "This factory delegates WebSocket creation to the provided OkHttpClient instance.\n")
                .addField(okHttpClientField)
                .addMethod(generateConstructor())
                .addMethod(generateCreateMethod())
                .build();

        JavaFile javaFile = JavaFile.builder(corePackageName, classSpec)
                .skipJavaLangImports(true)
                .build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }

    /** Generates the constructor. */
    private MethodSpec generateConstructor() {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(ParameterSpec.builder(ClassName.get("okhttp3", "OkHttpClient"), OKHTTP_CLIENT_FIELD)
                        .build())
                .addJavadoc("Creates a new OkHttpWebSocketFactory with the specified OkHttpClient.\n"
                        + "\n"
                        + "@param okHttpClient The OkHttpClient instance to use for creating WebSockets\n")
                .addStatement("this.$N = $N", OKHTTP_CLIENT_FIELD, OKHTTP_CLIENT_FIELD)
                .build();
    }

    /** Generates the create method implementation. */
    private MethodSpec generateCreateMethod() {
        return MethodSpec.methodBuilder("create")
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(ClassName.get("okhttp3", "WebSocket"))
                .addParameter(ParameterSpec.builder(ClassName.get("okhttp3", "Request"), "request")
                        .build())
                .addParameter(ParameterSpec.builder(ClassName.get("okhttp3", "WebSocketListener"), "listener")
                        .build())
                .addStatement("return $N.newWebSocket(request, listener)", OKHTTP_CLIENT_FIELD)
                .build();
    }

    /** Returns the class name for the generated implementation. */
    public ClassName getClassName() {
        return className;
    }
}
