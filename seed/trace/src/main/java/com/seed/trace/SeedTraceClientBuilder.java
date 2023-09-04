package com.seed.trace;

import com.seed.trace.core.ClientOptions;
import com.seed.trace.core.Environment;

public final class SeedTraceClientBuilder {
    private ClientOptions.Builder clientOptionsBuilder = ClientOptions.builder();

    private Environment environment = Environment.PROD;

    public SeedTraceClientBuilder token(String token) {
        this.clientOptionsBuilder.addHeader("Authorization", "Bearer " + token);
        return this;
    }

    public SeedTraceClientBuilder xRandomHeader(String xRandomHeader) {
        this.clientOptionsBuilder.addHeader("X-Random-Header", xRandomHeader);
        return this;
    }

    public SeedTraceClientBuilder environment(Environment environment) {
        this.environment = environment;
        return this;
    }

    public SeedTraceClientBuilder url(String url) {
        this.environment = Environment.custom(url);
        return this;
    }

    public SeedTraceClient build() {
        clientOptionsBuilder.environment(this.environment);
        return new SeedTraceClient(clientOptionsBuilder.build());
    }
}
