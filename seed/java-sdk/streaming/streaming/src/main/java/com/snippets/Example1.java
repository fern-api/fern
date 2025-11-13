package com.snippets;

import com.seed.streaming.SeedStreamingClient;
import com.seed.streaming.resources.dummy.requests.Generateequest;

public class Example1 {
    public static void main(String[] args) {
        SeedStreamingClient client =
                SeedStreamingClient.builder().url("https://api.fern.com").build();

        client.dummy()
                .generate(Generateequest.builder().stream(false).numEvents(5).build());
    }
}
