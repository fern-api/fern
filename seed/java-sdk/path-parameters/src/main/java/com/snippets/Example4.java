package com.snippets;

import com.seed.path.parameters.SeedPathParametersClient;
import com.seed.path.parameters.resources.user.types.User;
import java.util.ArrayList;
import java.util.Arrays;

public class Example4 {
    public static void run() {
        SeedPathParametersClient client = SeedPathParametersClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.user().createUser(
            "tenant_id",
            User
                .builder()
                .name("name")
                .tags(
                    new ArrayList<String>(
                        Arrays.asList("tags", "tags")
                    )
                )
                .build()
        );
    }
}