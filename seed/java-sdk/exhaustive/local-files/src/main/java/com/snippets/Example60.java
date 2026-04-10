package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpointsparams.requests.EndpointsParamsGetWithInlinePathRequest;

public class Example60 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsParams().endpointsParamsGetWithInlinePath(
            EndpointsParamsGetWithInlinePathRequest
                .builder()
                .param("param")
                .build()
        );
    }
}