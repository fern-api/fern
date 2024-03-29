/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.objectsWithImports;

import com.seed.objectsWithImports.core.ClientOptions;
import com.seed.objectsWithImports.core.Environment;

public final class SeedObjectsWithImportsClientBuilder {
    private ClientOptions.Builder clientOptionsBuilder = ClientOptions.builder();

    private Environment environment;

    public SeedObjectsWithImportsClientBuilder url(String url) {
        this.environment = Environment.custom(url);
        return this;
    }

    public SeedObjectsWithImportsClient build() {
        clientOptionsBuilder.environment(this.environment);
        return new SeedObjectsWithImportsClient(clientOptionsBuilder.build());
    }
}
