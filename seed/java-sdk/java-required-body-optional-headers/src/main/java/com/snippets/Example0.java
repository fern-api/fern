package com.snippets;

import com.seed.javaRequiredBodyOptionalHeaders.SeedJavaRequiredBodyOptionalHeadersClient;
import com.seed.javaRequiredBodyOptionalHeaders.requests.CreateUserRequest;
import com.seed.javaRequiredBodyOptionalHeaders.types.UserData;

public class Example0 {
    public static void main(String[] args) {
        SeedJavaRequiredBodyOptionalHeadersClient client = SeedJavaRequiredBodyOptionalHeadersClient.builder()
                .url("https://api.fern.com")
                .build();

        client.createUser(CreateUserRequest.builder()
                .body(UserData.builder().name("name").email("email").age(1).build())
                .xCorrelationId("X-Correlation-Id")
                .build());
    }
}
