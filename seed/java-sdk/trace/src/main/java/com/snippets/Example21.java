package com.snippets;

import com.seed.trace.SeedTraceClient;
import com.seed.trace.resources.commons.types.Language;

public class Example21 {
    public static void run() {
        SeedTraceClient client = SeedTraceClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.submission().createExecutionSession(Language.JAVA);
    }
}