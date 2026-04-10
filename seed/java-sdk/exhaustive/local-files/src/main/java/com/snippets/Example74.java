package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpointsparams.requests.EndpointsParamsGetWithPathAndErrorsRequest;

public class Example74 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsParams().endpointsParamsGetWithPathAndErrors(
            EndpointsParamsGetWithPathAndErrorsRequest
                .builder()
                .param("param")
                .build()
        );
    }
}