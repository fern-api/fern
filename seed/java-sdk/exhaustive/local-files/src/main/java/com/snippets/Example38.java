package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpoints.httpmethods.requests.TestDeleteHttpMethodsRequest;

public class Example38 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().httpMethods().testDelete(
            TestDeleteHttpMethodsRequest
                .builder()
                .id("id")
                .build()
        );
    }
}