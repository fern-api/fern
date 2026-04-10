package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceGetResourceRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service()
                .getresource("ResourceID", ServiceGetResourceRequest.builder().build());
    }
}
