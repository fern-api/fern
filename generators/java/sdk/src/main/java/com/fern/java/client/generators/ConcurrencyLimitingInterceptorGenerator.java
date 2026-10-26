package com.fern.java.client.generators;

import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedResourcesJavaFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public final class ConcurrencyLimitingInterceptorGenerator extends AbstractFileGenerator {

    public ConcurrencyLimitingInterceptorGenerator(ClientGeneratorContext clientGeneratorContext) {
        super(
                clientGeneratorContext.getPoetClassNameFactory().getConcurrencyLimitingInterceptorClassName(),
                clientGeneratorContext);
    }

    @Override
    public GeneratedResourcesJavaFile generateFile() {
        try (InputStream is = ConcurrencyLimitingInterceptorGenerator.class.getResourceAsStream(
                "/ConcurrencyLimitingInterceptor.java")) {
            String contents = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return GeneratedResourcesJavaFile.builder()
                    .className(className)
                    .contents(contents)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read ConcurrencyLimitingInterceptor.java");
        }
    }
}
