/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.multiLineDocs.resources.user;

import com.seed.multiLineDocs.core.ClientOptions;
import com.seed.multiLineDocs.core.RequestOptions;
import com.seed.multiLineDocs.resources.user.requests.CreateUserRequest;
import com.seed.multiLineDocs.resources.user.types.User;
import java.util.concurrent.CompletableFuture;

public class AsyncUserClient {
    protected final ClientOptions clientOptions;

    private final AsyncRawUserClient rawClient;

    public AsyncUserClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.rawClient = new AsyncRawUserClient(clientOptions);
    }

    /**
     * Get responses with HTTP metadata like headers
     */
    public AsyncRawUserClient withRawResponse() {
        return this.rawClient;
    }

    /**
     * Retrieve a user.
     * This endpoint is used to retrieve a user.
     */
    public CompletableFuture<Void> getUser(String userId) {
        return this.rawClient.getUser(userId).thenApply(response -> response.body());
    }

    /**
     * Retrieve a user.
     * This endpoint is used to retrieve a user.
     */
    public CompletableFuture<Void> getUser(String userId, RequestOptions requestOptions) {
        return this.rawClient.getUser(userId, requestOptions).thenApply(response -> response.body());
    }

    /**
     * Create a new user.
     * This endpoint is used to create a new user.
     */
    public CompletableFuture<User> createUser(CreateUserRequest request) {
        return this.rawClient.createUser(request).thenApply(response -> response.body());
    }

    /**
     * Create a new user.
     * This endpoint is used to create a new user.
     */
    public CompletableFuture<User> createUser(CreateUserRequest request, RequestOptions requestOptions) {
        return this.rawClient.createUser(request, requestOptions).thenApply(response -> response.body());
    }
}
