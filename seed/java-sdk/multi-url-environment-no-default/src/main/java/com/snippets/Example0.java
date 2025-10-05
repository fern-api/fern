package com.snippets;

import com.seed.multiUrlEnvironmentNoDefault.SeedMultiUrlEnvironmentNoDefaultClient;
import com.seed.multiUrlEnvironmentNoDefault.resources.ec2.requests.BootInstanceRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedMultiUrlEnvironmentNoDefaultClient client = SeedMultiUrlEnvironmentNoDefaultClient.builder()
                .token("<token>")
                .build();

        client.ec2().bootInstance(BootInstanceRequest.builder().size("size").build());
    }
}
