package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.EndpointsParamsGetWithInlinePathAndQueryRequest;

public class Example69 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsParams()
                .endpointsParamsGetWithInlinePathAndQuery(
                        "param",
                        EndpointsParamsGetWithInlinePathAndQueryRequest.builder()
                                .query("query")
                                .build());
    }
}
