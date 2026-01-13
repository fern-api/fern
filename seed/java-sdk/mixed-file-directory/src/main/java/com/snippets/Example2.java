package com.snippets;

import com.seed.mixedFileDirectory.SeedMixedFileDirectoryClient;
import com.seed.mixedFileDirectory.resources.user.events.requests.ListUserEventsRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedMixedFileDirectoryClient client = SeedMixedFileDirectoryClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.user().events().listEvents(
            ListUserEventsRequest
                .builder()
                .limit(1)
                .build()
        );
    }
}