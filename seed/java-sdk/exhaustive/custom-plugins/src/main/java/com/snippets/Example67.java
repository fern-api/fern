package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpointsparams.requests.EndpointsParamsGetWithPathAndQueryRequest;

public class Example67 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsParams()
                .endpointsParamsGetWithPathAndQuery(EndpointsParamsGetWithPathAndQueryRequest.builder()
                        .param("param")
                        .query("query")
                        .build());
    }
}
