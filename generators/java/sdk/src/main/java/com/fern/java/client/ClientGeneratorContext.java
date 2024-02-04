package com.fern.java.client;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.java.AbstractGeneratorContext;

public final class ClientGeneratorContext
        extends AbstractGeneratorContext<ClientPoetClassNameFactory, JavaSdkCustomConfig> {

    public ClientGeneratorContext(
            IntermediateRepresentation ir,
            GeneratorConfig generatorConfig,
            JavaSdkCustomConfig customConfig,
            ClientPoetClassNameFactory clientPoetClassNameFactory) {
        super(ir, generatorConfig, customConfig, clientPoetClassNameFactory);
    }

    @Override
    public boolean deserializeWithAdditionalProperties() {
        return true;
    }
}
