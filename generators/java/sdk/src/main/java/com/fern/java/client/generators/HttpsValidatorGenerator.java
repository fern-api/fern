package com.fern.java.client.generators;

import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedResourcesJavaFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public final class HttpsValidatorGenerator extends AbstractFileGenerator {

    public HttpsValidatorGenerator(ClientGeneratorContext clientGeneratorContext) {
        super(clientGeneratorContext.getPoetClassNameFactory().getHttpsValidatorClassName(), clientGeneratorContext);
    }

    @Override
    public GeneratedResourcesJavaFile generateFile() {
        try (InputStream is = HttpsValidatorGenerator.class.getResourceAsStream("/HttpsValidator.java")) {
            String contents = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return GeneratedResourcesJavaFile.builder()
                    .className(className)
                    .contents(contents)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read HttpsValidator.java");
        }
    }
}
