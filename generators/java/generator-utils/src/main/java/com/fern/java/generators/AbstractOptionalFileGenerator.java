package com.fern.java.generators;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedFile;
import com.squareup.javapoet.ClassName;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

public abstract class AbstractOptionalFileGenerator extends AbstractFilesGenerator {

    @SuppressWarnings("checkstyle:VisibilityModifier")
    protected ClassName className;

    public AbstractOptionalFileGenerator(ClassName className, AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext);
        this.className = className;
    }

    public abstract Optional<? extends GeneratedFile> generateFile();

    @Override
    public final List<GeneratedFile> generateFiles() {
        if (generateFile().isEmpty()) {
            return Collections.emptyList();
        }
        return Collections.singletonList(generateFile().get());
    }
}
