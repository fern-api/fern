/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.errorProperty;

import com.seed.errorProperty.core.ClientOptions;
import com.seed.errorProperty.core.Environment;

public final class SeedErrorPropertyClientBuilder {
    private ClientOptions.Builder clientOptionsBuilder = ClientOptions.builder();

    private Environment environment;

    public SeedErrorPropertyClientBuilder url(String url) {
        this.environment = Environment.custom(url);
        return this;
    }

    public SeedErrorPropertyClient build() {
        clientOptionsBuilder.environment(this.environment);
        return new SeedErrorPropertyClient(clientOptionsBuilder.build());
    }
}
