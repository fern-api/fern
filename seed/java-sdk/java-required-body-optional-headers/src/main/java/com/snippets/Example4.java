package com.snippets;

import com.seed.javaRequiredBodyOptionalHeaders.SeedJavaRequiredBodyOptionalHeadersClient;
import com.seed.javaRequiredBodyOptionalHeaders.requests.CreateUserWithRequiredQueryRequest;
import com.seed.javaRequiredBodyOptionalHeaders.types.UserData;

public class Example4 {
    public static void main(String[] args) {
        SeedJavaRequiredBodyOptionalHeadersClient client = SeedJavaRequiredBodyOptionalHeadersClient.builder()
                .url("https://api.fern.com")
                .build();

        client.createUserWithRequiredQuery(CreateUserWithRequiredQueryRequest.builder()
                .tenantId("tenantId")
                .body(UserData.builder().name("name").email("email").age(1).build())
                .build());
    }
}
