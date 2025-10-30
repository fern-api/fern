package com.fern.java.generators;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedFile;
import com.fern.java.output.GeneratedResourcesJavaFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class OptionalNullableGenerator extends AbstractFileGenerator {
    public OptionalNullableGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getOptionalNullableClassName(), generatorContext);
    }

    @Override
    public GeneratedFile generateFile() {
        try (InputStream is = OptionalNullableGenerator.class.getResourceAsStream("/OptionalNullable.java")) {
            String contents = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return GeneratedResourcesJavaFile.builder()
                    .className(className)
                    .contents(contents)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read OptionalNullable.java");
        }
    }
}