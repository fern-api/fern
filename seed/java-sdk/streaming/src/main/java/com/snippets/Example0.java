package com.snippets;

import com.seed.streaming.SeedStreamingClient;
import com.seed.streaming.resources.dummy.requests.GenerateStreamRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedStreamingClient client =
                SeedStreamingClient.builder().url("https://api.fern.com").build();

        client.dummy()
                .generateStream(GenerateStreamRequest.builder().stream(true)
                        .numEvents(1)
                        .build());
    }
}
