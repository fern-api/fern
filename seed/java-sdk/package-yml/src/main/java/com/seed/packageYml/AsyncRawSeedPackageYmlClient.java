/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.packageYml;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.seed.packageYml.core.ClientOptions;
import com.seed.packageYml.core.MediaTypes;
import com.seed.packageYml.core.ObjectMappers;
import com.seed.packageYml.core.RequestOptions;
import com.seed.packageYml.core.SeedPackageYmlApiException;
import com.seed.packageYml.core.SeedPackageYmlException;
import com.seed.packageYml.core.SeedPackageYmlHttpResponse;
import com.seed.packageYml.types.EchoRequest;
import java.io.IOException;
import java.util.concurrent.CompletableFuture;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Headers;
import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;
import org.jetbrains.annotations.NotNull;

public class AsyncRawSeedPackageYmlClient {
    protected final ClientOptions clientOptions;

    public AsyncRawSeedPackageYmlClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
    }

    public CompletableFuture<SeedPackageYmlHttpResponse<String>> echo(EchoRequest request) {
        return echo(request, null);
    }

    public CompletableFuture<SeedPackageYmlHttpResponse<String>> echo(
            EchoRequest request, RequestOptions requestOptions) {
        HttpUrl httpUrl = HttpUrl.parse(this.clientOptions.environment().getUrl())
                .newBuilder()
                .build();
        RequestBody body;
        try {
            body = RequestBody.create(
                    ObjectMappers.JSON_MAPPER.writeValueAsBytes(request), MediaTypes.APPLICATION_JSON);
        } catch (JsonProcessingException e) {
            throw new SeedPackageYmlException("Failed to serialize request", e);
        }
        Request okhttpRequest = new Request.Builder()
                .url(httpUrl)
                .method("POST", body)
                .headers(Headers.of(clientOptions.headers(requestOptions)))
                .addHeader("Content-Type", "application/json")
                .addHeader("Accept", "application/json")
                .build();
        OkHttpClient client = clientOptions.httpClient();
        if (requestOptions != null && requestOptions.getTimeout().isPresent()) {
            client = clientOptions.httpClientWithTimeout(requestOptions);
        }
        CompletableFuture<SeedPackageYmlHttpResponse<String>> future = new CompletableFuture<>();
        client.newCall(okhttpRequest).enqueue(new Callback() {
            @Override
            public void onResponse(@NotNull Call call, @NotNull Response response) throws IOException {
                try (ResponseBody responseBody = response.body()) {
                    if (response.isSuccessful()) {
                        future.complete(new SeedPackageYmlHttpResponse<>(
                                ObjectMappers.JSON_MAPPER.readValue(responseBody.string(), String.class), response));
                        return;
                    }
                    String responseBodyString = responseBody != null ? responseBody.string() : "{}";
                    future.completeExceptionally(new SeedPackageYmlApiException(
                            "Error with status code " + response.code(),
                            response.code(),
                            ObjectMappers.JSON_MAPPER.readValue(responseBodyString, Object.class),
                            response));
                    return;
                } catch (IOException e) {
                    future.completeExceptionally(
                            new SeedPackageYmlException("Network error executing HTTP request", e));
                }
            }

            @Override
            public void onFailure(@NotNull Call call, @NotNull IOException e) {
                future.completeExceptionally(new SeedPackageYmlException("Network error executing HTTP request", e));
            }
        });
        return future;
    }
}
