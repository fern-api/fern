package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceWithInlineTypeRequest;

public class Example7 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service().withinlinetype(ServiceWithInlineTypeRequest.builder().build());
    }
}
