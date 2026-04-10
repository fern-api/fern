package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpointsparams.requests.EndpointsParamsModifyWithInlinePathRequest;

public class Example63 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsParams()
                .endpointsParamsModifyWithInlinePath(EndpointsParamsModifyWithInlinePathRequest.builder()
                        .param("param")
                        .body("string")
                        .build());
    }
}
