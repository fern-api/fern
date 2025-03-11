package com.snippets;

import com.seed.mixed.file.directory.SeedMixedFileDirectoryClient;
import com.seed.mixed.file.directory.resources.user.events.metadata.requests.GetEventMetadataRequest;

public class Example3 {
    public static void run() {
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