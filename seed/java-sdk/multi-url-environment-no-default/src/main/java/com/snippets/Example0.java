package com.snippets;

import com.seed.multi.url.environment.no.default.SeedMultiUrlEnvironmentNoDefaultClient;
import com.seed.multi.url.environment.no.default.resources.ec2.requests.BootInstanceRequest;

public class Example0 {
    public static void run() {
        SeedMultiUrlEnvironmentNoDefaultClient client = SeedMultiUrlEnvironmentNoDefaultClient
            .builder()
            .token("<token>")
            .build();

        client.ec2().bootInstance(
            BootInstanceRequest
                .builder()
                .size("size")
                .build()
        );
    }
}