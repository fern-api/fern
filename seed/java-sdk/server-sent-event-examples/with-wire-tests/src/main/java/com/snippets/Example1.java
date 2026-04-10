package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.completions.requests.CompletionsStreamEventsRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.completions()
                .streamevents(
                        CompletionsStreamEventsRequest.builder().query("query").build());
    }
}
