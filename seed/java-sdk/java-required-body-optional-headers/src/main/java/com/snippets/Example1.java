package com.snippets;

import com.seed.javaRequiredBodyOptionalHeaders.SeedJavaRequiredBodyOptionalHeadersClient;
import com.seed.javaRequiredBodyOptionalHeaders.requests.UpdateUserRequest;
import com.seed.javaRequiredBodyOptionalHeaders.types.UserData;

public class Example1 {
    public static void main(String[] args) {
        SeedJavaRequiredBodyOptionalHeadersClient client = SeedJavaRequiredBodyOptionalHeadersClient.builder()
                .url("https://api.fern.com")
                .build();

        client.updateUser(
                "userId",
                UpdateUserRequest.builder()
                        .body(UserData.builder()
                                .name("name")
                                .email("email")
                                .age(1)
                                .build())
                        .dryRun(true)
                        .build());
    }
}
