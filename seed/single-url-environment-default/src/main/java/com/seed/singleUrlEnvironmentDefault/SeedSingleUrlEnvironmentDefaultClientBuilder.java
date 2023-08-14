package com.seed.singleUrlEnvironmentDefault;

import com.seed.singleUrlEnvironmentDefault.core.ClientOptions;
import com.seed.singleUrlEnvironmentDefault.core.Environment;

public final class SeedSingleUrlEnvironmentDefaultClientBuilder {
    private ClientOptions.Builder clientOptionsBuilder = ClientOptions.builder();

    private Environment environment = Environment.PRODUCTION;

    public SeedSingleUrlEnvironmentDefaultClientBuilder token(String token) {
        this.clientOptionsBuilder.addHeader("Authorization", "Bearer " + token);
        return this;
    }

    public SeedSingleUrlEnvironmentDefaultClientBuilder environment(Environment environment) {
        this.environment = environment;
        return this;
    }

    public SeedSingleUrlEnvironmentDefaultClientBuilder url(String url) {
        this.environment = Environment.custom(url);
        return this;
    }

    public SeedSingleUrlEnvironmentDefaultClient build() {
        clientOptionsBuilder.environment(this.environment);
        return new SeedSingleUrlEnvironmentDefaultClient(clientOptionsBuilder.build());
    }
}
