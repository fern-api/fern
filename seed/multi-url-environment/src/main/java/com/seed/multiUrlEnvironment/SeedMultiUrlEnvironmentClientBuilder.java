package com.seed.multiUrlEnvironment;

import com.seed.multiUrlEnvironment.core.ClientOptions;
import com.seed.multiUrlEnvironment.core.Environment;

public final class SeedMultiUrlEnvironmentClientBuilder {
    private ClientOptions.Builder clientOptionsBuilder = ClientOptions.builder();

    private Environment environment = Environment.PRODUCTION;

    public SeedMultiUrlEnvironmentClientBuilder token(String token) {
        this.clientOptionsBuilder.addHeader("Authorization", "Bearer " + token);
        return this;
    }

    public SeedMultiUrlEnvironmentClientBuilder environment(Environment environment) {
        this.environment = environment;
        return this;
    }

    public SeedMultiUrlEnvironmentClient build() {
        clientOptionsBuilder.environment(this.environment);
        return new SeedMultiUrlEnvironmentClient(clientOptionsBuilder.build());
    }
}
