package com.fern.model.codegen;

import com.fern.codegen.GeneratorContext;
import com.fern.codegen.IGeneratedFile;
import com.fern.codegen.utils.ClassNameUtils.PackageType;

public abstract class Generator {

    @SuppressWarnings("VisibilityModifier")
    protected final GeneratorContext generatorContext;

    @SuppressWarnings("VisibilityModifier")
    protected final PackageType packageType;

    public Generator(GeneratorContext generatorContext, PackageType packageType) {
        this.generatorContext = generatorContext;
        this.packageType = packageType;
    }

    public abstract IGeneratedFile generate();
}
