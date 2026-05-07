package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpoints.httpmethods.requests.HttpMethodsTestDeleteHttpMethodsRequest;

public class Example38 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .httpMethods()
                .httpMethodsTestDelete(
                        "id", HttpMethodsTestDeleteHttpMethodsRequest.builder().build());
    }
}
