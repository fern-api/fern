package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.ec2.requests.Ec2BootInstanceRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.ec2().bootinstance(Ec2BootInstanceRequest.builder().size("size").build());
    }
}
