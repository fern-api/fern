package com.fern.java.model;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.irV42.model.ir.IntermediateRepresentation;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.CustomConfig;

public class ModelGeneratorContext extends AbstractGeneratorContext<ModelPoetClassNameFactory, CustomConfig> {

    public ModelGeneratorContext(
            IntermediateRepresentation ir, GeneratorConfig generatorConfig, CustomConfig customConfig) {
        super(ir, generatorConfig, customConfig, new ModelPoetClassNameFactory(ir, generatorConfig.getOrganization()));
    }

    @Override
    public final boolean deserializeWithAdditionalProperties() {
        return false;
    }
}
