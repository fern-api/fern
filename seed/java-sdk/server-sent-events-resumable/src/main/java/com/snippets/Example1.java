package com.snippets;

import com.seed.serverSentEventsResumable.SeedServerSentEventsResumableClient;
import com.seed.serverSentEventsResumable.resources.completions.requests.StreamCompletionRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedServerSentEventsResumableClient client = SeedServerSentEventsResumableClient.builder()
                .url("https://api.fern.com")
                .build();

        client.completions().stream(
                StreamCompletionRequest.builder().query("query").build());
    }
}
