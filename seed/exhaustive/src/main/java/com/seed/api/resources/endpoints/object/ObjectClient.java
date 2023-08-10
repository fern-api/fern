package com.seed.api.resources.endpoints.object;

import com.seed.api.core.ClientOptions;
import com.seed.api.core.ObjectMappers;
import com.seed.api.core.RequestOptions;
import com.seed.api.resources.types.object.types.NestedObjectWithOptionalField;
import com.seed.api.resources.types.object.types.NestedObjectWithRequiredField;
import com.seed.api.resources.types.object.types.ObjectWithOptionalField;
import com.seed.api.resources.types.object.types.ObjectWithRequiredField;
import okhttp3.Headers;
import okhttp3.HttpUrl;
import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class ObjectClient {
    protected final ClientOptions clientOptions;

    public ObjectClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
    }

    public ObjectWithOptionalField getAndReturnWithOptionalField(ObjectWithOptionalField request) {
        return getAndReturnWithOptionalField(request, null);
    }

    public ObjectWithOptionalField getAndReturnWithOptionalField(
            ObjectWithOptionalField request, RequestOptions requestOptions) {
        HttpUrl _httpUrl = HttpUrl.parse(this.clientOptions.environment().getUrl())
                .newBuilder()
                .addPathSegments("object")
                .addPathSegments("get-and-return-with-optional-field")
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
                return ObjectMappers.JSON_MAPPER.readValue(_response.body().string(), ObjectWithOptionalField.class);
            }
            throw new RuntimeException();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public ObjectWithRequiredField getAndReturnWithRequiredField(ObjectWithRequiredField request) {
        return getAndReturnWithRequiredField(request, null);
    }

    public ObjectWithRequiredField getAndReturnWithRequiredField(
            ObjectWithRequiredField request, RequestOptions requestOptions) {
        HttpUrl _httpUrl = HttpUrl.parse(this.clientOptions.environment().getUrl())
                .newBuilder()
                .addPathSegments("object")
                .addPathSegments("get-and-return-with-required-field")
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
                return ObjectMappers.JSON_MAPPER.readValue(_response.body().string(), ObjectWithRequiredField.class);
            }
            throw new RuntimeException();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public NestedObjectWithOptionalField getAndReturnNestedWithOptionalField(NestedObjectWithOptionalField request) {
        return getAndReturnNestedWithOptionalField(request, null);
    }

    public NestedObjectWithOptionalField getAndReturnNestedWithOptionalField(
            NestedObjectWithOptionalField request, RequestOptions requestOptions) {
        HttpUrl _httpUrl = HttpUrl.parse(this.clientOptions.environment().getUrl())
                .newBuilder()
                .addPathSegments("object")
                .addPathSegments("get-and-return-nested-with-optional-field")
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
                return ObjectMappers.JSON_MAPPER.readValue(
                        _response.body().string(), NestedObjectWithOptionalField.class);
            }
            throw new RuntimeException();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public NestedObjectWithRequiredField getAndReturnNestedWithRequiredField(NestedObjectWithRequiredField request) {
        return getAndReturnNestedWithRequiredField(request, null);
    }

    public NestedObjectWithRequiredField getAndReturnNestedWithRequiredField(
            NestedObjectWithRequiredField request, RequestOptions requestOptions) {
        HttpUrl _httpUrl = HttpUrl.parse(this.clientOptions.environment().getUrl())
                .newBuilder()
                .addPathSegments("object")
                .addPathSegments("get-and-return-nested-with-required-field")
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
                return ObjectMappers.JSON_MAPPER.readValue(
                        _response.body().string(), NestedObjectWithRequiredField.class);
            }
            throw new RuntimeException();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
