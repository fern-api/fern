package com.snippets;

import com.seed.requestParameters.SeedRequestParametersClient;
import com.seed.requestParameters.resources.user.requests.CreateUsernameReferencedRequest;
import com.seed.requestParameters.resources.user.types.CreateUsernameBody;
import java.util.Arrays;

public class Example1 {
    public static void main(String[] args) {
        SeedRequestParametersClient client = SeedRequestParametersClient.builder()
                .url("https://api.fern.com")
                .build();

        client.user()
                .createUsernameWithReferencedType(CreateUsernameReferencedRequest.builder()
                        .body(CreateUsernameBody.builder()
                                .username("username")
                                .password("password")
                                .name("test")
                                .build())
                        .tags(Arrays.asList("tags", "tags"))
                        .build());
    }
}
