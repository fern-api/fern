package com.seed.api.core;

import okhttp3.Response;

public final class SeedApiHttpResponse<T> {

    private final T value;

    private final Response rawResponse;

    public SeedApiHttpResponse(T value, Response rawResponse) {
        this.value = value;
        this.rawResponse = rawResponse;
    }

    /**
     * The response body, deserialized from the body field on this instance's {@link SeedApiHttpResponse#rawResponse()}.
     * Is present iff the body field on this instance's {@link SeedApiHttpResponse#rawResponse()} is present.
     */
    public T value() {
        return this.value;
    }

    /**
     * The raw OkHttp response. Do not use the body of this response; if it is present, it will be closed because its
     * contents will have been read and deserialized into this instance's {@link SeedApiHttpResponse#value()}.
     */
    public Response rawResponse() {
        return this.rawResponse;
    }
}
