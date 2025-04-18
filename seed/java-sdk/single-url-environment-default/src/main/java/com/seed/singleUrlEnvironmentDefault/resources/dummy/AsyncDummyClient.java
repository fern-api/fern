/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.singleUrlEnvironmentDefault.resources.dummy;

import com.seed.singleUrlEnvironmentDefault.core.ClientOptions;
import com.seed.singleUrlEnvironmentDefault.core.RequestOptions;
import java.util.concurrent.CompletableFuture;

public class AsyncDummyClient {
    protected final ClientOptions clientOptions;

    private final AsyncRawDummyClient rawClient;

    public AsyncDummyClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.rawClient = new AsyncRawDummyClient(clientOptions);
    }

    /**
     * Get responses with HTTP metadata like headers
     */
    public AsyncRawDummyClient withRawResponse() {
        return this.rawClient;
    }

    public CompletableFuture<String> getDummy() {
        return this.rawClient.getDummy().thenApply(response -> response.body());
    }

    public CompletableFuture<String> getDummy(RequestOptions requestOptions) {
        return this.rawClient.getDummy(requestOptions).thenApply(response -> response.body());
    }
}
