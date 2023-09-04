package com.seed.plainText;

import com.seed.plainText.core.ClientOptions;
import com.seed.plainText.core.Environment;

public final class SeedPlainTextClientBuilder {
    private ClientOptions.Builder clientOptionsBuilder = ClientOptions.builder();

    private Environment environment;

    public SeedPlainTextClientBuilder url(String url) {
        this.environment = Environment.custom(url);
        return this;
    }

    public SeedPlainTextClient build() {
        clientOptionsBuilder.environment(this.environment);
        return new SeedPlainTextClient(clientOptionsBuilder.build());
    }
}
