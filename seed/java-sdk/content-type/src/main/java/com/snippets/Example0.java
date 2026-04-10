package com.snippets;

import com.seed.contentTypes.SeedContentTypesClient;
import com.seed.contentTypes.resources.service.requests.PatchProxyRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedContentTypesClient client =
                SeedContentTypesClient.builder().url("https://api.fern.com").build();

        client.service()
                .patch(PatchProxyRequest.builder()
                        .application("application")
                        .requireAuth(true)
                        .build());
    }
}
