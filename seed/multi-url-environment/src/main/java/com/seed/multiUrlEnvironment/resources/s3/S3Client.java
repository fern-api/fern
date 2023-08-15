package com.seed.multiUrlEnvironment.resources.s3;

import com.seed.multiUrlEnvironment.core.ApiError;
import com.seed.multiUrlEnvironment.core.ClientOptions;
import com.seed.multiUrlEnvironment.core.ObjectMappers;
import com.seed.multiUrlEnvironment.core.RequestOptions;
import com.seed.multiUrlEnvironment.resources.s3.requests.GetPresignedUrlRequest;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import okhttp3.Headers;
import okhttp3.HttpUrl;
import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class S3Client {
    protected final ClientOptions clientOptions;

    public S3Client(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
    }

    public String getPresignedUrl(GetPresignedUrlRequest request) {
        return getPresignedUrl(request, null);
    }

    public String getPresignedUrl(GetPresignedUrlRequest request, RequestOptions requestOptions) {
        HttpUrl _httpUrl = HttpUrl.parse(this.clientOptions.environment().gets3URL())
                .newBuilder()
                .addPathSegments("s3")
                .addPathSegments("presigned-url")
                .build();
        Map<String, Object> _requestBodyProperties = new HashMap<>();
        _requestBodyProperties.put("s3Key", request.getS3Key());
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
