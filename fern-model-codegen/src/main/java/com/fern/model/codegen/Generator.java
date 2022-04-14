package com.fern.model.codegen;

public abstract class Generator<D> {

    @SuppressWarnings("VisibilityModifier")
    protected final GeneratorContext generatorContext;

    public Generator(GeneratorContext generatorContext) {
        this.generatorContext = generatorContext;
    }

    public abstract GeneratedFile<D> generate();
}
