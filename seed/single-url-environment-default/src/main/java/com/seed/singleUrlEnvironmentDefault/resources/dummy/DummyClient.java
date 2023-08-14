package com.seed.singleUrlEnvironmentDefault.resources.dummy;

import com.seed.singleUrlEnvironmentDefault.core.ClientOptions;
import com.seed.singleUrlEnvironmentDefault.core.ObjectMappers;
import com.seed.singleUrlEnvironmentDefault.core.RequestOptions;
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
            throw new RuntimeException();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
