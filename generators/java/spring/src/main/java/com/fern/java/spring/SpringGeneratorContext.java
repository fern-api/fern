package com.fern.java.spring;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.ir.model.auth.AuthScheme;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.java.AbstractGeneratorContext;
import java.util.List;

public final class SpringGeneratorContext
        extends AbstractGeneratorContext<SpringLocalFilesPoetClassNameFactory, SpringCustomConfig> {

    public SpringGeneratorContext(
            IntermediateRepresentation ir,
            GeneratorConfig generatorConfig,
            SpringCustomConfig customConfig,
            List<AuthScheme> resolvedAuthSchemes) {
        super(
                ir,
                generatorConfig,
                customConfig,
                new SpringLocalFilesPoetClassNameFactory(customConfig.packagePrefix(), customConfig.packageLayout()),
                resolvedAuthSchemes);
    }

    @Override
    public GeneratorType getType() {
        return GeneratorType.SPRING;
    }

    @Override
    public boolean deserializeWithAdditionalProperties() {
        return false;
    }

    @Override
    public boolean builderNotNullChecks() {
        return true;
    }
}
