package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceWithJsonPropertyRequest;

public class Example8 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service()
                .withjsonproperty(ServiceWithJsonPropertyRequest.builder().build());
    }
}
