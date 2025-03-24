package com.snippets;

import com.seed.examples.SeedExamplesClient;
import com.seed.examples.resources.service.requests.GetMetadataRequest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;

public class Example16 {
    public static void main(String[] args) {
        SeedExamplesClient client = SeedExamplesClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().getMetadata(
            GetMetadataRequest
                .builder()
                .xApiVersion("0.0.1")
                .tag(
                    new ArrayList<Optional<String>>(
                        Arrays.asList("development")
                    )
                )
                .shallow(false)
                .build()
        );
    }
}