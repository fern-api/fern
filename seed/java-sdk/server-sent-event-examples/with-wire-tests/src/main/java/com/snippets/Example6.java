package com.snippets;

import com.seed.serverSentEvents.SeedServerSentEventsClient;
import com.seed.serverSentEvents.resources.completions.requests.StreamEventsRequest;

public class Example6 {
    public static void main(String[] args) {
        SeedServerSentEventsClient client =
                SeedServerSentEventsClient.builder().url("https://api.fern.com").build();

        client.completions()
                .streamEvents(StreamEventsRequest.builder().query("query").build());
    }
}
