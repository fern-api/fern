package com.fern.model.codegen;

import com.fern.codegen.GeneratedFile;

public abstract class Generator {

    @SuppressWarnings("VisibilityModifier")
    protected final GeneratorContext generatorContext;

    public Generator(GeneratorContext generatorContext) {
        this.generatorContext = generatorContext;
    }

    public abstract GeneratedFile generate();
}
