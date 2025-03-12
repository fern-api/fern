package com.snippets;

import com.seed.extra.properties.SeedExtraPropertiesClient;
import com.seed.extra.properties.resources.user.requests.CreateUserRequest;

public class Example0 {
    public static void run() {
        SeedExtraPropertiesClient client = SeedExtraPropertiesClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.user().createUser(
            CreateUserRequest
                .builder()
                .type("CreateUserRequest")
                .version("v1")
                .name("name")
                .build()
        );
    }
}