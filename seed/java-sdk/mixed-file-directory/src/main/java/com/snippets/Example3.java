package com.snippets;

import com.seed.mixedFileDirectory.SeedMixedFileDirectoryClient;
import com.seed.mixedFileDirectory.resources.user.events.metadata.requests.GetEventMetadataRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedMixedFileDirectoryClient client = SeedMixedFileDirectoryClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.user().events().metadata().getMetadata(
            GetEventMetadataRequest
                .builder()
                .id("id")
                .build()
        );
    }
}