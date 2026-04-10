package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpointsparams.requests.EndpointsParamsGetWithPathRequest;

public class Example56 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsParams()
                .endpointsParamsGetWithPath(
                        "param", EndpointsParamsGetWithPathRequest.builder().build());
    }
}
