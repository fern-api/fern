package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpointsparams.requests.EndpointsParamsGetWithInlinePathAndQueryRequest;

public class Example69 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsParams().endpointsParamsGetWithInlinePathAndQuery(
            EndpointsParamsGetWithInlinePathAndQueryRequest
                .builder()
                .param("param")
                .query("query")
                .build()
        );
    }
}