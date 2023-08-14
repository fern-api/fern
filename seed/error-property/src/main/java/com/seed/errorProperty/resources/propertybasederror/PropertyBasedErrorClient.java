package com.seed.errorProperty.resources.propertybasederror;

import com.seed.errorProperty.core.ClientOptions;
import com.seed.errorProperty.core.ObjectMappers;
import com.seed.errorProperty.core.RequestOptions;
import okhttp3.Headers;
import okhttp3.HttpUrl;
import okhttp3.Request;
import okhttp3.Response;

public class PropertyBasedErrorClient {
    protected final ClientOptions clientOptions;

    public PropertyBasedErrorClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
    }

    public String throwError() {
        return throwError(null);
    }

    public String throwError(RequestOptions requestOptions) {
        HttpUrl _httpUrl = HttpUrl.parse(this.clientOptions.environment().getUrl())
                .newBuilder()
                .addPathSegments("property-based-error")
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
