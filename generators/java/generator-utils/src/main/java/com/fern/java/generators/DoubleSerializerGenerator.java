package com.fern.java.generators;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedResourcesJavaFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public final class DoubleSerializerGenerator extends AbstractFileGenerator {

    public static final String GET_MODULE_METHOD_NAME = "getModule";

    public DoubleSerializerGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getDoubleSerializerClassName(), generatorContext);
    }

    @Override
    public GeneratedResourcesJavaFile generateFile() {
        try (InputStream is = DoubleSerializerGenerator.class.getResourceAsStream("/DoubleSerializer.java")) {
            String contents = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return GeneratedResourcesJavaFile.builder()
                    .className(className)
                    .contents(contents)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read DoubleSerializer.java");
        }
    }
}
