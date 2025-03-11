package com.snippets;

import com.seed.mixed.file.directory.SeedMixedFileDirectoryClient;
import com.seed.mixed.file.directory.resources.user.events.requests.ListUserEventsRequest;

public class Example2 {
    public static void run() {
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