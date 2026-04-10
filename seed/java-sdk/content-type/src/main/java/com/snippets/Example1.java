package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServicePatchRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service()
                .patch(ServicePatchRequest.builder()
                        .application("application")
                        .requireAuth(true)
                        .build());
    }
}
