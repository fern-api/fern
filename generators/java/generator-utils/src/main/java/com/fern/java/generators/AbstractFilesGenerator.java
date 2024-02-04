package com.fern.java.generators;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedFile;
import java.util.List;

public abstract class AbstractFilesGenerator {

    @SuppressWarnings("checkstyle:VisibilityModifier")
    protected AbstractGeneratorContext<?, ?> generatorContext;

    public AbstractFilesGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        this.generatorContext = generatorContext;
    }

    public abstract List<GeneratedFile> generateFiles();
}
