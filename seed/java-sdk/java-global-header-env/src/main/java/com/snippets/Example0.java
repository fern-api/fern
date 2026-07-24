package com.snippets;

import com.seed.javaGlobalHeaderEnv.SeedJavaGlobalHeaderEnvClient;

public class Example0 {
    public static void main(String[] args) {
        SeedJavaGlobalHeaderEnvClient client = SeedJavaGlobalHeaderEnvClient.builder()
                .url("https://api.fern.com")
                .build();

        client.service().getWithApiVersion();
    }
}
