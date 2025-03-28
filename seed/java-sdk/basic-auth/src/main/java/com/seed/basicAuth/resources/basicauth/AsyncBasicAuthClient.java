/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.basicAuth.resources.basicauth;

import com.seed.basicAuth.core.ClientOptions;
import com.seed.basicAuth.core.RequestOptions;
import java.util.concurrent.CompletableFuture;

public class AsyncBasicAuthClient {
    protected final ClientOptions clientOptions;

    private final AsyncRawBasicAuthClient rawClient;

    public AsyncBasicAuthClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.rawClient = new AsyncRawBasicAuthClient(clientOptions);
    }

    /**
     * Get responses with HTTP metadata like headers
     */
    public AsyncRawBasicAuthClient withRawResponse() {
        return this.rawClient;
    }

    /**
     * GET request with basic auth scheme
     */
    public CompletableFuture<Boolean> getWithBasicAuth() {
        return this.rawClient.getWithBasicAuth().thenApply(response -> response.body());
    }

    /**
     * GET request with basic auth scheme
     */
    public CompletableFuture<Boolean> getWithBasicAuth(RequestOptions requestOptions) {
        return this.rawClient.getWithBasicAuth(requestOptions).thenApply(response -> response.body());
    }

    /**
     * POST request with basic auth scheme
     */
    public CompletableFuture<Boolean> postWithBasicAuth(Object request) {
        return this.rawClient.postWithBasicAuth(request).thenApply(response -> response.body());
    }

    /**
     * POST request with basic auth scheme
     */
    public CompletableFuture<Boolean> postWithBasicAuth(Object request, RequestOptions requestOptions) {
        return this.rawClient.postWithBasicAuth(request, requestOptions).thenApply(response -> response.body());
    }
}
