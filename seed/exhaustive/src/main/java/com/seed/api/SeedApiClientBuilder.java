package com.seed.api;

import com.seed.api.core.ClientOptions;
import com.seed.api.core.Environment;

public final class SeedApiClientBuilder {
    private ClientOptions.Builder clientOptionsBuilder = ClientOptions.builder();

    private Environment environment;

    public SeedApiClientBuilder token(String token) {
        this.clientOptionsBuilder.addHeader("Authorization", "Bearer " + token);
        return this;
    }

    public SeedApiClientBuilder url(String url) {
        this.environment = Environment.custom(url);
        return this;
    }

    public SeedApiClient build() {
        clientOptionsBuilder.environment(this.environment);
        return new SeedApiClient(clientOptionsBuilder.build());
    }
}
