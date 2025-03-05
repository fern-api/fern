package com.fern.java.generators;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedFile;
import com.fern.java.output.GeneratedResourcesJavaFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class NullableNonemptyFilterGenerator extends AbstractFileGenerator {
    public NullableNonemptyFilterGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getNullableNonemptyFilterClassName(), generatorContext);
    }

    @Override
    public GeneratedFile generateFile() {
        try (InputStream is =
                NullableNonemptyFilterGenerator.class.getResourceAsStream("/NullableNonemptyFilter.java")) {
            String contents = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return GeneratedResourcesJavaFile.builder()
                    .className(className)
                    .contents(contents)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read NullableNonemptyFilter.java");
        }
    }
}
