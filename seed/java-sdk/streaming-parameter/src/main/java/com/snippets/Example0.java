package com.snippets;

import com.seed.streaming.SeedStreamingClient;
import com.seed.streaming.resources.dummy.requests.GenerateRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedStreamingClient client =
                SeedStreamingClient.builder().url("https://api.fern.com").build();

        client.dummy()
                .generate(GenerateRequest.builder().stream(false).numEvents(5).build());
    }
}
