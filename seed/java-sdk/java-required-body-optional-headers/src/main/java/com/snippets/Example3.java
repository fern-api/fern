package com.snippets;

import com.seed.javaRequiredBodyOptionalHeaders.SeedJavaRequiredBodyOptionalHeadersClient;
import com.seed.javaRequiredBodyOptionalHeaders.requests.CreateUserWithRequiredHeaderRequest;
import com.seed.javaRequiredBodyOptionalHeaders.types.UserData;

public class Example3 {
    public static void main(String[] args) {
        SeedJavaRequiredBodyOptionalHeadersClient client = SeedJavaRequiredBodyOptionalHeadersClient.builder()
                .url("https://api.fern.com")
                .build();

        client.createUserWithRequiredHeader(CreateUserWithRequiredHeaderRequest.builder()
                .xApiKey("X-Api-Key")
                .body(UserData.builder().name("name").email("email").age(1).build())
                .build());
    }
}
