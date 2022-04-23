package com.fern.model.codegen;

import com.fern.codegen.GeneratedFileWithDefinition;

public abstract class Generator<D> {

    @SuppressWarnings("VisibilityModifier")
    protected final GeneratorContext generatorContext;

    public Generator(GeneratorContext generatorContext) {
        this.generatorContext = generatorContext;
    }

    public abstract GeneratedFileWithDefinition<D> generate();
}
