package com.snippets;

import com.seed.phpGlobalHeaderEnv.SeedPhpGlobalHeaderEnvClient;

public class Example0 {
    public static void main(String[] args) {
        SeedPhpGlobalHeaderEnvClient client = SeedPhpGlobalHeaderEnvClient.builder()
                .url("https://api.fern.com")
                .build();

        client.service().getWithApiVersion();
    }
}
