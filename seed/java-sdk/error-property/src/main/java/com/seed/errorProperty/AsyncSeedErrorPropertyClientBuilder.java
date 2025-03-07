/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.errorProperty;

import com.seed.errorProperty.core.ClientOptions;
import com.seed.errorProperty.core.Environment;
import okhttp3.OkHttpClient;

public final class AsyncSeedErrorPropertyClientBuilder {
    private ClientOptions.Builder clientOptionsBuilder = ClientOptions.builder();

    private Environment environment;

    public AsyncSeedErrorPropertyClientBuilder url(String url) {
        this.environment = Environment.custom(url);
        return this;
    }

    /**
     * Sets the timeout (in seconds) for the client
     */
    public AsyncSeedErrorPropertyClientBuilder timeout(int timeout) {
        this.clientOptionsBuilder.timeout(timeout);
        return this;
    }

    /**
     * Sets the underlying OkHttp client
     */
    public AsyncSeedErrorPropertyClientBuilder httpClient(OkHttpClient httpClient) {
        this.clientOptionsBuilder.httpClient(httpClient);
        return this;
    }

    public AsyncSeedErrorPropertyClient build() {
        clientOptionsBuilder.environment(this.environment);
        return new AsyncSeedErrorPropertyClient(clientOptionsBuilder.build());
    }
}
