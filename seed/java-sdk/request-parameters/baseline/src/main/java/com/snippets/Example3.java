package com.snippets;

import com.seed.requestParameters.SeedRequestParametersClient;
import com.seed.requestParameters.resources.user.types.CreateUsernameBodyOptionalProperties;

public class Example3 {
    public static void main(String[] args) {
        SeedRequestParametersClient client = SeedRequestParametersClient.builder()
                .url("https://api.fern.com")
                .build();

        client.user()
                .createUsernameOptional(CreateUsernameBodyOptionalProperties.builder()
                        .username("username")
                        .password("password")
                        .name("test")
                        .build());
    }
}
