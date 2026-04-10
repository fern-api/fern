package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpointsparams.requests.EndpointsParamsGetWithInlinePathRequest;

public class Example60 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsParams()
                .endpointsParamsGetWithInlinePath(EndpointsParamsGetWithInlinePathRequest.builder()
                        .param("param")
                        .build());
    }
}
