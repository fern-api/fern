package com.snippets;

import com.seed.serverSentEvents.SeedServerSentEventsClient;
import com.seed.serverSentEvents.resources.completions.requests.StreamEventsContextProtocolRequest;

public class Example12 {
    public static void main(String[] args) {
        SeedServerSentEventsClient client =
                SeedServerSentEventsClient.builder().url("https://api.fern.com").build();

        client.completions()
                .streamEventsContextProtocol(
                        StreamEventsContextProtocolRequest.builder().query("").build());
    }
}
