package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceNamedPatchWithMixedRequest;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service()
                .namedpatchwithmixed(
                        "id",
                        ServiceNamedPatchWithMixedRequest.builder()
                                .instructions("instructions")
                                .active(true)
                                .appId("appId")
                                .build());
    }
}
