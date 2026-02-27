package com.snippets;

import com.seed.serverSentEvents.SeedServerSentEventsClient;
import com.seed.serverSentEvents.resources.completions.requests.StreamCompletionRequestWithoutTerminator;

public class Example2 {
    public static void main(String[] args) {
        SeedServerSentEventsClient client =
                SeedServerSentEventsClient.builder().url("https://api.fern.com").build();

        client.completions()
                .streamWithoutTerminator(StreamCompletionRequestWithoutTerminator.builder()
                        .query("query")
                        .build());
    }
}
