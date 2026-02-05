package com.snippets;

import com.seed.extraProperties.SeedExtraPropertiesClient;
import com.seed.extraProperties.resources.user.requests.CreateUserRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedExtraPropertiesClient client =
                SeedExtraPropertiesClient.builder().url("https://api.fern.com").build();

        client.user().createUser(CreateUserRequest.builder().name("name").build());
    }
}
