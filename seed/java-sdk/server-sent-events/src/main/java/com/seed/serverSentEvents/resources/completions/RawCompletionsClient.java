/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.serverSentEvents.resources.completions;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.seed.serverSentEvents.core.ClientOptions;
import com.seed.serverSentEvents.core.MediaTypes;
import com.seed.serverSentEvents.core.ObjectMappers;
import com.seed.serverSentEvents.core.RequestOptions;
import com.seed.serverSentEvents.core.ResponseBodyReader;
import com.seed.serverSentEvents.core.SeedServerSentEventsApiException;
import com.seed.serverSentEvents.core.SeedServerSentEventsException;
import com.seed.serverSentEvents.core.SeedServerSentEventsHttpResponse;
import com.seed.serverSentEvents.core.Stream;
import com.seed.serverSentEvents.resources.completions.requests.StreamCompletionRequest;
import com.seed.serverSentEvents.resources.completions.types.StreamedCompletion;
import java.io.IOException;
import okhttp3.Headers;
import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;

public class RawCompletionsClient {
    protected final ClientOptions clientOptions;

    public RawCompletionsClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
    }

    public SeedServerSentEventsHttpResponse<Iterable<StreamedCompletion>> stream(StreamCompletionRequest request) {
        return stream(request, null);
    }

    public SeedServerSentEventsHttpResponse<Iterable<StreamedCompletion>> stream(
            StreamCompletionRequest request, RequestOptions requestOptions) {
        HttpUrl httpUrl = HttpUrl.parse(this.clientOptions.environment().getUrl())
                .newBuilder()
                .addPathSegments("stream")
                .build();
        RequestBody body;
        try {
            body = RequestBody.create(
                    ObjectMappers.JSON_MAPPER.writeValueAsBytes(request), MediaTypes.APPLICATION_JSON);
        } catch (JsonProcessingException e) {
            throw new SeedServerSentEventsException("Failed to serialize request", e);
        }
        Request okhttpRequest = new Request.Builder()
                .url(httpUrl)
                .method("POST", body)
                .headers(Headers.of(clientOptions.headers(requestOptions)))
                .addHeader("Content-Type", "application/json")
                .build();
        OkHttpClient client = clientOptions.httpClient();
        if (requestOptions != null && requestOptions.getTimeout().isPresent()) {
            client = clientOptions.httpClientWithTimeout(requestOptions);
        }
        try {
            Response response = client.newCall(okhttpRequest).execute();
            ResponseBody responseBody = response.body();
            if (response.isSuccessful()) {
                return new SeedServerSentEventsHttpResponse<>(
                        Stream.fromSse(StreamedCompletion.class, new ResponseBodyReader(response), "[[DONE]]"),
                        response);
            }
            String responseBodyString = responseBody != null ? responseBody.string() : "{}";
            throw new SeedServerSentEventsApiException(
                    "Error with status code " + response.code(),
                    response.code(),
                    ObjectMappers.JSON_MAPPER.readValue(responseBodyString, Object.class),
                    response);
        } catch (IOException e) {
            throw new SeedServerSentEventsException("Network error executing HTTP request", e);
        }
    }
}
