package com.snippets;

import com.seed.requestParameters.SeedRequestParametersClient;
import com.seed.requestParameters.resources.user.requests.CreateUsernameRequest;
import java.util.Arrays;

public class Example0 {
    public static void main(String[] args) {
        SeedRequestParametersClient client = SeedRequestParametersClient.builder()
                .url("https://api.fern.com")
                .build();

        client.user()
                .createUsername(CreateUsernameRequest.builder()
                        .username("username")
                        .password("password")
                        .name("test")
                        .tags(Arrays.asList("tags", "tags"))
                        .build());
    }
}
