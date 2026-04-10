package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpointsparams.requests.EndpointsParamsGetWithBooleanPathRequest;

public class Example71 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsParams().endpointsParamsGetWithBooleanPath(
            EndpointsParamsGetWithBooleanPathRequest
                .builder()
                .param(true)
                .build()
        );
    }
}