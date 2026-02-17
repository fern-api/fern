package com.fern.java.client;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.ir.model.auth.AuthScheme;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.java.AbstractGeneratorContext;
import java.util.List;
import java.util.Map;

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

    public ClientGeneratorContext(
            IntermediateRepresentation ir,
            GeneratorConfig generatorConfig,
            JavaSdkCustomConfig customConfig,
            ClientPoetClassNameFactory clientPoetClassNameFactory,
            List<AuthScheme> resolvedAuthSchemes,
            Map<TypeId, String> discriminatorContexts) {
        super(
                ir,
                generatorConfig,
                customConfig,
                clientPoetClassNameFactory,
                resolvedAuthSchemes,
                discriminatorContexts);
    }

    @Override
    public GeneratorType getType() {
        return GeneratorType.SDK;
    }

    @Override
    public boolean deserializeWithAdditionalProperties() {
        return true;
    }

    @Override
    public boolean builderNotNullChecks() {
        return true;
    }
}
