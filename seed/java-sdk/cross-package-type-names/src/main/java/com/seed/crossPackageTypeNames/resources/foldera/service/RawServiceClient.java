/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.crossPackageTypeNames.resources.foldera.service;

import com.seed.crossPackageTypeNames.core.ClientOptions;
import com.seed.crossPackageTypeNames.core.ObjectMappers;
import com.seed.crossPackageTypeNames.core.RequestOptions;
import com.seed.crossPackageTypeNames.core.SeedCrossPackageTypeNamesApiException;
import com.seed.crossPackageTypeNames.core.SeedCrossPackageTypeNamesException;
import com.seed.crossPackageTypeNames.core.SeedCrossPackageTypeNamesHttpResponse;
import com.seed.crossPackageTypeNames.resources.foldera.service.types.Response;
import java.io.IOException;
import okhttp3.Headers;
import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.ResponseBody;

public class RawServiceClient {
    protected final ClientOptions clientOptions;

    public RawServiceClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
    }

    public SeedCrossPackageTypeNamesHttpResponse<Response> getDirectThread() {
        return getDirectThread(null);
    }

    public SeedCrossPackageTypeNamesHttpResponse<Response> getDirectThread(RequestOptions requestOptions) {
        HttpUrl httpUrl = HttpUrl.parse(this.clientOptions.environment().getUrl())
                .newBuilder()
                .build();
        Request okhttpRequest = new Request.Builder()
                .url(httpUrl)
                .method("GET", null)
                .headers(Headers.of(clientOptions.headers(requestOptions)))
                .addHeader("Accept", "application/json")
                .build();
        OkHttpClient client = clientOptions.httpClient();
        if (requestOptions != null && requestOptions.getTimeout().isPresent()) {
            client = clientOptions.httpClientWithTimeout(requestOptions);
        }
        try (okhttp3.Response response = client.newCall(okhttpRequest).execute()) {
            ResponseBody responseBody = response.body();
            if (response.isSuccessful()) {
                return new SeedCrossPackageTypeNamesHttpResponse<>(
                        ObjectMappers.JSON_MAPPER.readValue(responseBody.string(), Response.class), response);
            }
            String responseBodyString = responseBody != null ? responseBody.string() : "{}";
            throw new SeedCrossPackageTypeNamesApiException(
                    "Error with status code " + response.code(),
                    response.code(),
                    ObjectMappers.JSON_MAPPER.readValue(responseBodyString, Object.class),
                    response);
        } catch (IOException e) {
            throw new SeedCrossPackageTypeNamesException("Network error executing HTTP request", e);
        }
    }
}
