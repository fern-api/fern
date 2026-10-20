package com.fern.java.generators.tests;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedFile;
import com.fern.java.output.GeneratedResourcesJavaFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class PathSegmentsTestGenerator extends AbstractFileGenerator {

    public PathSegmentsTestGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getPathSegmentsTestClassName(), generatorContext);
    }

    @Override
    public GeneratedFile generateFile() {
        try (InputStream is =
                PathSegmentsTestGenerator.class.getResourceAsStream("/tests/PathSegmentsTest.Template.java")) {
            String contents = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return GeneratedResourcesJavaFile.builder()
                    .className(className)
                    .contents(contents)
                    .testFile(true)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read PathSegmentsTest.Template.java");
        }
    }
}
