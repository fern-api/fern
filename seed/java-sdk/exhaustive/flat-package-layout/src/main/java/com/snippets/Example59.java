package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.EndpointsParamsModifyWithPathRequest;

public class Example59 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsParams()
                .endpointsParamsModifyWithPath(
                        "param",
                        EndpointsParamsModifyWithPathRequest.builder()
                                .body("string")
                                .build());
    }
}
