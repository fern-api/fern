package com.snippets;

import com.seed.multiUrlEnvironment.SeedMultiUrlEnvironmentClient;
import com.seed.multiUrlEnvironment.resources.ec2.requests.BootInstanceRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedMultiUrlEnvironmentClient client =
                SeedMultiUrlEnvironmentClient.builder().token("<token>").build();

        client.ec2().bootInstance(BootInstanceRequest.builder().size("size").build());
    }
}
