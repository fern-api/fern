package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.user.requests.CreateUsernameBody;
import java.util.Arrays;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.user()
                .createusernamewithreferencedtype(CreateUsernameBody.builder()
                        .username("username")
                        .password("password")
                        .name("name")
                        .tags(Arrays.asList("tags"))
                        .build());
    }
}
