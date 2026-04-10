package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceOptionalArgsRequest;

public class Example6 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service().optionalargs(ServiceOptionalArgsRequest.builder().build());
    }
}
