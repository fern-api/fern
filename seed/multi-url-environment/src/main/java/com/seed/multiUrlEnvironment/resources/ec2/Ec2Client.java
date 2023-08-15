package com.seed.multiUrlEnvironment.resources.ec2;

import com.seed.multiUrlEnvironment.core.ApiError;
import com.seed.multiUrlEnvironment.core.ClientOptions;
import com.seed.multiUrlEnvironment.core.ObjectMappers;
import com.seed.multiUrlEnvironment.core.RequestOptions;
import com.seed.multiUrlEnvironment.resources.ec2.requests.BootInstanceRequest;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import okhttp3.Headers;
import okhttp3.HttpUrl;
import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class Ec2Client {
    protected final ClientOptions clientOptions;

    public Ec2Client(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
    }

    public void bootInstance(BootInstanceRequest request) {
        bootInstance(request, null);
    }

    public void bootInstance(BootInstanceRequest request, RequestOptions requestOptions) {
        HttpUrl _httpUrl = HttpUrl.parse(this.clientOptions.environment().getec2URL())
                .newBuilder()
                .addPathSegments("ec2")
                .addPathSegments("boot")
                .build();
        Map<String, Object> _requestBodyProperties = new HashMap<>();
        _requestBodyProperties.put("size", request.getSize());
        RequestBody _requestBody;
        try {
            _requestBody = RequestBody.create(
                    ObjectMappers.JSON_MAPPER.writeValueAsBytes(_requestBodyProperties),
                    MediaType.parse("application/json"));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        Request.Builder _requestBuilder = new Request.Builder()
                .url(_httpUrl)
                .method("POST", _requestBody)
                .headers(Headers.of(clientOptions.headers(requestOptions)))
                .addHeader("Content-Type", "application/json");
        Request _request = _requestBuilder.build();
        try {
            Response _response = clientOptions.httpClient().newCall(_request).execute();
            if (_response.isSuccessful()) {
                return;
            }
            throw new ApiError(
                    _response.code(),
                    ObjectMappers.JSON_MAPPER.readValue(_response.body().string(), Object.class));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
