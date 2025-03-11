package com.snippets;

import com.seed.multi.url.environment.SeedMultiUrlEnvironmentClient;
import com.seed.multi.url.environment.resources.ec2.requests.BootInstanceRequest;

public class Example0 {
    public static void run() {
        SeedMultiUrlEnvironmentClient client = SeedMultiUrlEnvironmentClient
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