package com.fern.java.generators;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedFile;
import com.fern.java.output.GeneratedResourcesJavaFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public final class QueryStringMapperGenerator extends AbstractFileGenerator {
    public QueryStringMapperGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getQueryStringMapperClassName(), generatorContext);
    }

    @Override
    public GeneratedFile generateFile() {
        try (InputStream is = QueryStringMapperGenerator.class.getResourceAsStream("/QueryStringMapper.java")) {
            String contents = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return GeneratedResourcesJavaFile.builder()
                    .className(className)
                    .contents(contents)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read QueryStringMapper.java");
        }
    }
}
