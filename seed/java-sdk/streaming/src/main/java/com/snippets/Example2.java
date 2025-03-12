package com.snippets;

import com.seed.streaming.SeedStreamingClient;
import com.seed.streaming.resources.dummy.requests.Generateequest;

public class Example2 {
    public static void run() {
        SeedStreamingClient client = SeedStreamingClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.dummy().generate(
            Generateequest
                .builder()
                .stream(false)
                .numEvents(1)
                .build()
        );
    }
}