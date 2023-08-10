package com.seed.api.resources.endpoints.union;

import com.seed.api.core.ClientOptions;
import com.seed.api.core.ObjectMappers;
import com.seed.api.core.RequestOptions;
import com.seed.api.resources.types.union.types.Animal;
import okhttp3.Headers;
import okhttp3.HttpUrl;
import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class UnionClient {
    protected final ClientOptions clientOptions;

    public UnionClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
    }

    public Animal getAndReturnUnion(Animal request) {
        return getAndReturnUnion(request, null);
    }

    public Animal getAndReturnUnion(Animal request, RequestOptions requestOptions) {
        HttpUrl _httpUrl = HttpUrl.parse(this.clientOptions.environment().getUrl())
                .newBuilder()
                .addPathSegments("union")
                .build();
        RequestBody _requestBody;
        try {
            _requestBody = RequestBody.create(
                    ObjectMappers.JSON_MAPPER.writeValueAsBytes(request), MediaType.parse("application/json"));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        Request _request = new Request.Builder()
                .url(_httpUrl)
                .method("POST", _requestBody)
                .headers(Headers.of(clientOptions.headers(requestOptions)))
                .addHeader("Content-Type", "application/json")
                .build();
        try {
            Response _response = clientOptions.httpClient().newCall(_request).execute();
            if (_response.isSuccessful()) {
                return ObjectMappers.JSON_MAPPER.readValue(_response.body().string(), Animal.class);
            }
            throw new RuntimeException();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
