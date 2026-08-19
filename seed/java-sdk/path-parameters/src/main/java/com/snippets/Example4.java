package com.snippets;

import com.seed.pathParameters.SeedPathParametersClient;
import com.seed.pathParameters.resources.user.types.User;
import java.util.Arrays;

public class Example4 {
    public static void main(String[] args) {
        SeedPathParametersClient client = SeedPathParametersClient.builder()
                .url("https://api.fern.com")
                .tenantId("tenant_id")
                .build();

        client.user()
                .createUser(User.builder()
                        .name("name")
                        .tags(Arrays.asList("tags", "tags"))
                        .build());
    }
}
