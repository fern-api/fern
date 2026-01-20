package com.snippets;

import com.seed.javaRequiredBodyOptionalHeaders.SeedJavaRequiredBodyOptionalHeadersClient;
import com.seed.javaRequiredBodyOptionalHeaders.requests.CreateUserWithOptionsRequest;
import com.seed.javaRequiredBodyOptionalHeaders.types.UserData;

public class Example2 {
    public static void main(String[] args) {
        SeedJavaRequiredBodyOptionalHeadersClient client = SeedJavaRequiredBodyOptionalHeadersClient.builder()
                .url("https://api.fern.com")
                .build();

        client.createUserWithOptions(CreateUserWithOptionsRequest.builder()
                .body(UserData.builder().name("name").email("email").age(1).build())
                .xRequestId("X-Request-Id")
                .validate(true)
                .build());
    }
}
