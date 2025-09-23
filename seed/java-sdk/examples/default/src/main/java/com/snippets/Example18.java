package com.snippets;

import com.seed.examples.SeedExamplesClient;
import com.seed.examples.resources.service.requests.GetMetadataRequest;
import java.util.Arrays;
import java.util.Optional;

public class Example18 {
    public static void main(String[] args) {
        SeedExamplesClient client = SeedExamplesClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().getMetadata(
            GetMetadataRequest
                .builder()
                .xApiVersion("X-API-Version")
                .tag(
                    Arrays.asList(Optional.of("tag"))
                )
                .shallow(true)
                .build()
        );
    }
}