package com.seed.noEnvironment;

import com.seed.noEnvironment.core.ClientOptions;
import com.seed.noEnvironment.core.Environment;

public final class SeedNoEnvironmentClientBuilder {
    private ClientOptions.Builder clientOptionsBuilder = ClientOptions.builder();

    private Environment environment;

    public SeedNoEnvironmentClientBuilder token(String token) {
        this.clientOptionsBuilder.addHeader("Authorization", "Bearer " + token);
        return this;
    }

    public SeedNoEnvironmentClientBuilder url(String url) {
        this.environment = Environment.custom(url);
        return this;
    }

    public SeedNoEnvironmentClient build() {
        clientOptionsBuilder.environment(this.environment);
        return new SeedNoEnvironmentClient(clientOptionsBuilder.build());
    }
}
