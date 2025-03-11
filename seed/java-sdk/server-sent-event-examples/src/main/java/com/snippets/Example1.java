package com.snippets;

import com.seed.server.sent.events.SeedServerSentEventsClient;
import com.seed.server.sent.events.resources.completions.requests.StreamCompletionRequest;

public class Example1 {
    public static void run() {
        SeedServerSentEventsClient client = SeedServerSentEventsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.completions().stream(
            StreamCompletionRequest
                .builder()
                .query("query")
                .build()
        );
    }
}