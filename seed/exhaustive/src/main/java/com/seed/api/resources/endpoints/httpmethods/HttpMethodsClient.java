package com.seed.api.resources.endpoints.httpmethods;

import com.seed.api.core.ClientOptions;
import com.seed.api.core.ObjectMappers;
import com.seed.api.core.RequestOptions;
import com.seed.api.resources.types.object.types.ObjectWithOptionalField;
import com.seed.api.resources.types.object.types.ObjectWithRequiredField;
import okhttp3.Headers;
import okhttp3.HttpUrl;
import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class HttpMethodsClient {
    protected final ClientOptions clientOptions;

    public HttpMethodsClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
    }

    public String testGet(String id) {
        return testGet(id, null);
    }

    public String testGet(String id, RequestOptions requestOptions) {
        HttpUrl _httpUrl = HttpUrl.parse(this.clientOptions.environment().getUrl())
                .newBuilder()
                .addPathSegments("http-methods")
                .addPathSegment(id)
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

    public ObjectWithOptionalField testPost(ObjectWithRequiredField request) {
        return testPost(request, null);
    }

    public ObjectWithOptionalField testPost(ObjectWithRequiredField request, RequestOptions requestOptions) {
        HttpUrl _httpUrl = HttpUrl.parse(this.clientOptions.environment().getUrl())
                .newBuilder()
                .addPathSegments("http-methods")
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

    public ObjectWithOptionalField testPut(String id, ObjectWithRequiredField request) {
        return testPut(id, request, null);
    }

    public ObjectWithOptionalField testPut(String id, ObjectWithRequiredField request, RequestOptions requestOptions) {
        HttpUrl _httpUrl = HttpUrl.parse(this.clientOptions.environment().getUrl())
                .newBuilder()
                .addPathSegments("http-methods")
                .addPathSegment(id)
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
                .method("PUT", _requestBody)
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

    public ObjectWithOptionalField testPatch(String id, ObjectWithOptionalField request) {
        return testPatch(id, request, null);
    }

    public ObjectWithOptionalField testPatch(
            String id, ObjectWithOptionalField request, RequestOptions requestOptions) {
        HttpUrl _httpUrl = HttpUrl.parse(this.clientOptions.environment().getUrl())
                .newBuilder()
                .addPathSegments("http-methods")
                .addPathSegment(id)
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
                .method("PATCH", _requestBody)
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

    public boolean testDelete(String id) {
        return testDelete(id, null);
    }

    public boolean testDelete(String id, RequestOptions requestOptions) {
        HttpUrl _httpUrl = HttpUrl.parse(this.clientOptions.environment().getUrl())
                .newBuilder()
                .addPathSegments("http-methods")
                .addPathSegment(id)
                .build();
        Request _request = new Request.Builder()
                .url(_httpUrl)
                .method("DELETE", null)
                .headers(Headers.of(clientOptions.headers(requestOptions)))
                .addHeader("Content-Type", "application/json")
                .build();
        try {
            Response _response = clientOptions.httpClient().newCall(_request).execute();
            if (_response.isSuccessful()) {
                return ObjectMappers.JSON_MAPPER.readValue(_response.body().string(), boolean.class);
            }
            throw new RuntimeException();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
