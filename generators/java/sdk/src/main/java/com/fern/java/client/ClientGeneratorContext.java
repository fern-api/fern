package com.fern.java.client;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.ir.model.auth.AuthScheme;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.java.AbstractGeneratorContext;
import java.util.List;

public final class ClientGeneratorContext
        extends AbstractGeneratorContext<ClientPoetClassNameFactory, JavaSdkCustomConfig> {

    public ClientGeneratorContext(
            IntermediateRepresentation ir,
            GeneratorConfig generatorConfig,
            JavaSdkCustomConfig customConfig,
            ClientPoetClassNameFactory clientPoetClassNameFactory,
            List<AuthScheme> resolvedAuthSchemes) {
        super(ir, generatorConfig, customConfig, clientPoetClassNameFactory, resolvedAuthSchemes);
    }

    @Override
    public boolean deserializeWithAdditionalProperties() {
        return true;
    }
}
