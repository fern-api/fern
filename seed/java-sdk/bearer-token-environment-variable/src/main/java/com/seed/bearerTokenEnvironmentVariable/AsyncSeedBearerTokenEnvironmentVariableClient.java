/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.bearerTokenEnvironmentVariable;

import com.seed.bearerTokenEnvironmentVariable.core.ClientOptions;
import com.seed.bearerTokenEnvironmentVariable.core.Suppliers;
import com.seed.bearerTokenEnvironmentVariable.resources.service.AsyncServiceClient;
import java.util.function.Supplier;

public class AsyncSeedBearerTokenEnvironmentVariableClient {
    protected final ClientOptions clientOptions;

    protected final Supplier<AsyncServiceClient> serviceClient;

    public AsyncSeedBearerTokenEnvironmentVariableClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.serviceClient = Suppliers.memoize(() -> new AsyncServiceClient(clientOptions));
    }

    public AsyncServiceClient service() {
        return this.serviceClient.get();
    }

    public static AsyncSeedBearerTokenEnvironmentVariableClientBuilder builder() {
        return new AsyncSeedBearerTokenEnvironmentVariableClientBuilder();
    }
}
