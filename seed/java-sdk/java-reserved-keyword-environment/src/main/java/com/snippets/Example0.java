package com.snippets;

import com.seed.javaReservedKeywordEnvironment.SeedJavaReservedKeywordEnvironmentClient;

public class Example0 {
    public static void main(String[] args) {
        SeedJavaReservedKeywordEnvironmentClient client = SeedJavaReservedKeywordEnvironmentClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service().get();
    }
}
