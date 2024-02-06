package com.fern.java.generators.object;

import com.fern.java.PoetTypeWithClassName;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.MethodSpec;
import java.util.List;

public final class ObjectBuilder {

    private final List<PoetTypeWithClassName> generatedTypes;

    private final MethodSpec builderStaticMethod;

    private final ClassName builderImplClassName;

    public ObjectBuilder(
            List<PoetTypeWithClassName> generatedTypes,
            MethodSpec builderStaticMethod,
            ClassName builderImplClassName) {
        this.generatedTypes = generatedTypes;
        this.builderStaticMethod = builderStaticMethod;
        this.builderImplClassName = builderImplClassName;
    }

    public List<PoetTypeWithClassName> getGeneratedTypes() {
        return generatedTypes;
    }

    public MethodSpec getBuilderStaticMethod() {
        return builderStaticMethod;
    }

    public ClassName getBuilderImplClassName() {
        return builderImplClassName;
    }
}
