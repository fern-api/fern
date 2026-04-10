package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceWithLiteralAndEnumTypesRequest;

public class Example11 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service()
                .withliteralandenumtypes(
                        ServiceWithLiteralAndEnumTypesRequest.builder().build());
    }
}
