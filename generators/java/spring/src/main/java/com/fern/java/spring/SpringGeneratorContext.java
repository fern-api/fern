package com.fern.java.spring;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.irV42.model.auth.AuthScheme;
import com.fern.irV42.model.ir.IntermediateRepresentation;
import com.fern.java.AbstractGeneratorContext;
import java.util.List;

public final class SpringGeneratorContext
        extends AbstractGeneratorContext<SpringLocalFilesPoetClassNameFactory, SpringCustomConfig> {

    public SpringGeneratorContext(
            IntermediateRepresentation ir,
            GeneratorConfig generatorConfig,
            SpringCustomConfig customConfig,
            SpringDownloadFilesCustomConfig springDownloadFilesCustomConfig,
            List<AuthScheme> resolvedAuthSchemes) {
        super(
                ir,
                generatorConfig,
                customConfig,
                new SpringLocalFilesPoetClassNameFactory(springDownloadFilesCustomConfig.packagePrefix()),
                resolvedAuthSchemes);
    }

    @Override
    public boolean deserializeWithAdditionalProperties() {
        return false;
    }
}
