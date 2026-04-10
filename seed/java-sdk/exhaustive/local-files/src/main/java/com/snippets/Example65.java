package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpointsparams.requests.EndpointsParamsGetWithQueryRequest;

public class Example65 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsParams().endpointsParamsGetWithQuery(
            EndpointsParamsGetWithQueryRequest
                .builder()
                .query("query")
                .number(1)
                .build()
        );
    }
}