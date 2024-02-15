package com.fern.java.spring;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.java.AbstractGeneratorContext;

public final class SpringGeneratorContext
        extends AbstractGeneratorContext<SpringLocalFilesPoetClassNameFactory, SpringCustomConfig> {

    public SpringGeneratorContext(
            IntermediateRepresentation ir,
            GeneratorConfig generatorConfig,
            SpringCustomConfig customConfig,
            SpringDownloadFilesCustomConfig springDownloadFilesCustomConfig) {
        super(
                ir,
                generatorConfig,
                customConfig,
                new SpringLocalFilesPoetClassNameFactory(springDownloadFilesCustomConfig.packagePrefix()));
    }

    @Override
    public boolean deserializeWithAdditionalProperties() {
        return false;
    }
}
