package com.seed.bytes;

import com.seed.bytes.core.ClientOptions;
import com.seed.bytes.core.Environment;

public final class SeedBytesClientBuilder {
    private ClientOptions.Builder clientOptionsBuilder = ClientOptions.builder();

    private Environment environment;

    public SeedBytesClientBuilder url(String url) {
        this.environment = Environment.custom(url);
        return this;
    }

    public SeedBytesClient build() {
        clientOptionsBuilder.environment(this.environment);
        return new SeedBytesClient(clientOptionsBuilder.build());
    }
}
