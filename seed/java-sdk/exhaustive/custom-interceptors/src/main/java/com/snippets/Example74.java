package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpointsparams.requests.EndpointsParamsGetWithPathAndErrorsRequest;

public class Example74 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsParams()
                .endpointsParamsGetWithPathAndErrors(
                        "param",
                        EndpointsParamsGetWithPathAndErrorsRequest.builder().build());
    }
}
