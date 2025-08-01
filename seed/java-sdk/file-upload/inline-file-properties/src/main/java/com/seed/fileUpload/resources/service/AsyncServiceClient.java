/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.fileUpload.resources.service;

import com.seed.fileUpload.core.ClientOptions;
import com.seed.fileUpload.core.RequestOptions;
import com.seed.fileUpload.resources.service.requests.InlineTypeRequest;
import com.seed.fileUpload.resources.service.requests.JustFileRequest;
import com.seed.fileUpload.resources.service.requests.JustFileWithQueryParamsRequest;
import com.seed.fileUpload.resources.service.requests.MyOtherRequest;
import com.seed.fileUpload.resources.service.requests.MyRequest;
import com.seed.fileUpload.resources.service.requests.OptionalArgsRequest;
import com.seed.fileUpload.resources.service.requests.WithContentTypeRequest;
import com.seed.fileUpload.resources.service.requests.WithFormEncodingRequest;
import java.util.concurrent.CompletableFuture;

public class AsyncServiceClient {
    protected final ClientOptions clientOptions;

    private final AsyncRawServiceClient rawClient;

    public AsyncServiceClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.rawClient = new AsyncRawServiceClient(clientOptions);
    }

    /**
     * Get responses with HTTP metadata like headers
     */
    public AsyncRawServiceClient withRawResponse() {
        return this.rawClient;
    }

    public CompletableFuture<Void> post(MyRequest request) {
        return this.rawClient.post(request).thenApply(response -> response.body());
    }

    public CompletableFuture<Void> post(MyRequest request, RequestOptions requestOptions) {
        return this.rawClient.post(request, requestOptions).thenApply(response -> response.body());
    }

    public CompletableFuture<Void> justFile(JustFileRequest request) {
        return this.rawClient.justFile(request).thenApply(response -> response.body());
    }

    public CompletableFuture<Void> justFile(JustFileRequest request, RequestOptions requestOptions) {
        return this.rawClient.justFile(request, requestOptions).thenApply(response -> response.body());
    }

    public CompletableFuture<Void> justFileWithQueryParams(JustFileWithQueryParamsRequest request) {
        return this.rawClient.justFileWithQueryParams(request).thenApply(response -> response.body());
    }

    public CompletableFuture<Void> justFileWithQueryParams(
            JustFileWithQueryParamsRequest request, RequestOptions requestOptions) {
        return this.rawClient.justFileWithQueryParams(request, requestOptions).thenApply(response -> response.body());
    }

    public CompletableFuture<Void> withContentType(WithContentTypeRequest request) {
        return this.rawClient.withContentType(request).thenApply(response -> response.body());
    }

    public CompletableFuture<Void> withContentType(WithContentTypeRequest request, RequestOptions requestOptions) {
        return this.rawClient.withContentType(request, requestOptions).thenApply(response -> response.body());
    }

    public CompletableFuture<Void> withFormEncoding(WithFormEncodingRequest request) {
        return this.rawClient.withFormEncoding(request).thenApply(response -> response.body());
    }

    public CompletableFuture<Void> withFormEncoding(WithFormEncodingRequest request, RequestOptions requestOptions) {
        return this.rawClient.withFormEncoding(request, requestOptions).thenApply(response -> response.body());
    }

    public CompletableFuture<Void> withFormEncodedContainers(MyOtherRequest request) {
        return this.rawClient.withFormEncodedContainers(request).thenApply(response -> response.body());
    }

    public CompletableFuture<Void> withFormEncodedContainers(MyOtherRequest request, RequestOptions requestOptions) {
        return this.rawClient.withFormEncodedContainers(request, requestOptions).thenApply(response -> response.body());
    }

    public CompletableFuture<String> optionalArgs() {
        return this.rawClient.optionalArgs().thenApply(response -> response.body());
    }

    public CompletableFuture<String> optionalArgs(OptionalArgsRequest request) {
        return this.rawClient.optionalArgs(request).thenApply(response -> response.body());
    }

    public CompletableFuture<String> optionalArgs(OptionalArgsRequest request, RequestOptions requestOptions) {
        return this.rawClient.optionalArgs(request, requestOptions).thenApply(response -> response.body());
    }

    public CompletableFuture<String> withInlineType(InlineTypeRequest request) {
        return this.rawClient.withInlineType(request).thenApply(response -> response.body());
    }

    public CompletableFuture<String> withInlineType(InlineTypeRequest request, RequestOptions requestOptions) {
        return this.rawClient.withInlineType(request, requestOptions).thenApply(response -> response.body());
    }

    public CompletableFuture<Void> simple() {
        return this.rawClient.simple().thenApply(response -> response.body());
    }

    public CompletableFuture<Void> simple(RequestOptions requestOptions) {
        return this.rawClient.simple(requestOptions).thenApply(response -> response.body());
    }
}
