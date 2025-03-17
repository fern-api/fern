package com.snippets;

import com.seed.trace.SeedTraceClient;

public class Example22 {
    public static void run() {
        SeedTraceClient client = SeedTraceClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.submission().getExecutionSession("sessionId");
    }
}