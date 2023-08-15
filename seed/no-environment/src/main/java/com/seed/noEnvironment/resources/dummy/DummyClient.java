package com.seed.noEnvironment.resources.dummy;

import com.seed.noEnvironment.core.ApiError;
import com.seed.noEnvironment.core.ClientOptions;
import com.seed.noEnvironment.core.ObjectMappers;
import com.seed.noEnvironment.core.RequestOptions;
import java.io.IOException;
import okhttp3.Headers;
import okhttp3.HttpUrl;
import okhttp3.Request;
import okhttp3.Response;

public class DummyClient {
    protected final ClientOptions clientOptions;

    public DummyClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
    }

    public String getDummy() {
        return getDummy(null);
    }

    public String getDummy(RequestOptions requestOptions) {
        HttpUrl _httpUrl = HttpUrl.parse(this.clientOptions.environment().getUrl())
                .newBuilder()
                .addPathSegments("dummy")
                .build();
        Request _request = new Request.Builder()
                .url(_httpUrl)
                .method("GET", null)
                .headers(Headers.of(clientOptions.headers(requestOptions)))
                .addHeader("Content-Type", "application/json")
                .build();
        try {
            Response _response = clientOptions.httpClient().newCall(_request).execute();
            if (_response.isSuccessful()) {
                return ObjectMappers.JSON_MAPPER.readValue(_response.body().string(), String.class);
            }
            throw new ApiError(
                    _response.code(),
                    ObjectMappers.JSON_MAPPER.readValue(_response.body().string(), Object.class));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
