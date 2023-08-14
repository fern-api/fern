package com.seed.customAuth;

import com.seed.customAuth.core.ClientOptions;
import com.seed.customAuth.core.Environment;

public final class SeedCustomAuthClientBuilder {
    private ClientOptions.Builder clientOptionsBuilder = ClientOptions.builder();

    private Environment environment;

    public SeedCustomAuthClientBuilder customAuthScheme(String customAuthScheme) {
        this.clientOptionsBuilder.addHeader("X-API-KEY", customAuthScheme);
        return this;
    }

    public SeedCustomAuthClientBuilder url(String url) {
        this.environment = Environment.custom(url);
        return this;
    }

    public SeedCustomAuthClient build() {
        clientOptionsBuilder.environment(this.environment);
        return new SeedCustomAuthClient(clientOptionsBuilder.build());
    }
}
