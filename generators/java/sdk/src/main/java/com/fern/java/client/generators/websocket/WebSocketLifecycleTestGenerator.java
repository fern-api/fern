package com.fern.java.client.generators.websocket;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedFile;
import com.fern.java.output.GeneratedResourcesJavaFile;
import com.squareup.javapoet.ClassName;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Generates a unit test for the WebSocket lifecycle in the core package: closing ClientOptions disconnects tracked
 * WebSocket clients before the OkHttp dispatcher is shut down, and connect/reconnect attempts after close fail with a
 * clear IllegalStateException instead of OkHttp's executor-rejected error.
 */
public class WebSocketLifecycleTestGenerator extends AbstractFileGenerator {

    public WebSocketLifecycleTestGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(
                ClassName.get(generatorContext.getPoetClassNameFactory().getCorePackage(), "WebSocketLifecycleTest"),
                generatorContext);
    }

    @Override
    public GeneratedFile generateFile() {
        try (InputStream is = WebSocketLifecycleTestGenerator.class.getResourceAsStream(
                "/tests/WebSocketLifecycleTest.Template.java")) {
            String contents = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return GeneratedResourcesJavaFile.builder()
                    .className(className)
                    .contents(contents)
                    .testFile(true)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read WebSocketLifecycleTest.Template.java", e);
        }
    }
}
