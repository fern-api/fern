package com.snippets;

import com.seed.serverSentEvents.SeedServerSentEventsClient;
import com.seed.serverSentEvents.resources.completions.requests.StreamCompletionRequest;

public class Example1 {
    public static void main(String[] args) {
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