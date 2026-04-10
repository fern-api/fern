package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.completions.requests.CompletionsStreamEventsContextProtocolRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.completions()
                .streameventscontextprotocol(CompletionsStreamEventsContextProtocolRequest.builder()
                        .query("query")
                        .build());
    }
}
