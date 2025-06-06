/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.pagination.resources.complex;

import com.seed.pagination.core.ClientOptions;
import com.seed.pagination.core.RequestOptions;
import com.seed.pagination.core.pagination.SyncPagingIterable;
import com.seed.pagination.resources.complex.types.Conversation;
import com.seed.pagination.resources.complex.types.SearchRequest;
import java.util.concurrent.CompletableFuture;

public class AsyncComplexClient {
    protected final ClientOptions clientOptions;

    private final AsyncRawComplexClient rawClient;

    public AsyncComplexClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.rawClient = new AsyncRawComplexClient(clientOptions);
    }

    /**
     * Get responses with HTTP metadata like headers
     */
    public AsyncRawComplexClient withRawResponse() {
        return this.rawClient;
    }

    public CompletableFuture<SyncPagingIterable<Conversation>> search(String index, SearchRequest request) {
        return this.rawClient.search(index, request).thenApply(response -> response.body());
    }

    public CompletableFuture<SyncPagingIterable<Conversation>> search(
            String index, SearchRequest request, RequestOptions requestOptions) {
        return this.rawClient.search(index, request, requestOptions).thenApply(response -> response.body());
    }
}
