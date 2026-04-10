package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceNamedPatchWithMixedRequest;

public class Example4 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service()
                .namedpatchwithmixed(
                        "id", ServiceNamedPatchWithMixedRequest.builder().build());
    }
}
