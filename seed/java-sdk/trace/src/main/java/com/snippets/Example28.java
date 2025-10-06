package com.snippets;

import com.seed.trace.SeedTraceClient;
import com.seed.trace.resources.commons.types.Language;

public class Example28 {
    public static void main(String[] args) {
        SeedTraceClient client = SeedTraceClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.sysprop().setNumWarmInstances(Language.JAVA, 1);
    }
}
