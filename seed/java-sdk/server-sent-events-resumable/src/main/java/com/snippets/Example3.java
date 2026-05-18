package com.snippets;

import com.seed.serverSentEventsResumable.SeedServerSentEventsResumableClient;
import com.seed.serverSentEventsResumable.resources.completions.requests.StreamCompletionRequestNonResumable;

public class Example3 {
    public static void main(String[] args) {
        SeedServerSentEventsResumableClient client = SeedServerSentEventsResumableClient.builder()
                .url("https://api.fern.com")
                .build();

        client.completions()
                .streamNonResumable(StreamCompletionRequestNonResumable.builder()
                        .query("query")
                        .build());
    }
}
