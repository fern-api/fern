package com.fern.java.model;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.CustomConfig;
import java.util.List;

public class ModelGeneratorContext extends AbstractGeneratorContext<ModelPoetClassNameFactory, CustomConfig> {

    public static final List<com.fern.ir.model.auth.AuthScheme> NO_AUTH_SCHEMES = List.of();

    public ModelGeneratorContext(
            IntermediateRepresentation ir, GeneratorConfig generatorConfig, CustomConfig customConfig) {
        super(
                ir,
                generatorConfig,
                customConfig,
                new ModelPoetClassNameFactory(ir, generatorConfig.getOrganization()),
                NO_AUTH_SCHEMES);
    }

    @Override
    public final boolean deserializeWithAdditionalProperties() {
        return false;
    }
}
