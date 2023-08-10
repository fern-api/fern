package com.seed.api.resources.reqwithheaders;

import com.seed.api.core.ClientOptions;
import com.seed.api.core.ObjectMappers;
import com.seed.api.core.RequestOptions;
import com.seed.api.resources.reqwithheaders.requests.ReqWithHeaders;
import okhttp3.Headers;
import okhttp3.HttpUrl;
import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class ReqWithHeadersClient {
    protected final ClientOptions clientOptions;

    public ReqWithHeadersClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
    }

    public void getWithCustomHeader(ReqWithHeaders request) {
        getWithCustomHeader(request, null);
    }

    public void getWithCustomHeader(ReqWithHeaders request, RequestOptions requestOptions) {
        HttpUrl _httpUrl = HttpUrl.parse(this.clientOptions.environment().getUrl())
                .newBuilder()
                .addPathSegments("test-headers")
                .addPathSegments("custom-header")
                .build();
        RequestBody _requestBody;
        try {
            _requestBody = RequestBody.create(
                    ObjectMappers.JSON_MAPPER.writeValueAsBytes(request.getBody()),
                    MediaType.parse("application/json"));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        Request.Builder _requestBuilder = new Request.Builder()
                .url(_httpUrl)
                .method("POST", _requestBody)
                .headers(Headers.of(clientOptions.headers(requestOptions)))
                .addHeader("Content-Type", "application/json");
        _requestBuilder.addHeader("X-TEST-SERVICE-HEADER", request.getXTestServiceHeader());
        _requestBuilder.addHeader("X-TEST-ENDPOINT-HEADER", request.getXTestEndpointHeader());
        Request _request = _requestBuilder.build();
        try {
            Response _response = clientOptions.httpClient().newCall(_request).execute();
            if (_response.isSuccessful()) {
                return;
            }
            throw new RuntimeException();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
