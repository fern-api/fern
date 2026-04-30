package com.snippets;

import com.seed.serverSentEvents.SeedServerSentEventsClient;
import com.seed.serverSentEvents.resources.completions.requests.StreamEventsDiscriminantInDataRequest;

public class Example10 {
    public static void main(String[] args) {
        SeedServerSentEventsClient client =
                SeedServerSentEventsClient.builder().url("https://api.fern.com").build();

        client.completions()
                .streamEventsDiscriminantInData(StreamEventsDiscriminantInDataRequest.builder()
                        .query("query")
                        .build());
    }
}
