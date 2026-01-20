package com.snippets;

import com.seed.javaRequiredBodyOptionalHeaders.SeedJavaRequiredBodyOptionalHeadersClient;
import com.seed.javaRequiredBodyOptionalHeaders.requests.CreateUserInlinedRequest;

public class Example6 {
    public static void main(String[] args) {
        SeedJavaRequiredBodyOptionalHeadersClient client = SeedJavaRequiredBodyOptionalHeadersClient.builder()
                .url("https://api.fern.com")
                .build();

        client.createUserInlined(CreateUserInlinedRequest.builder()
                .name("name")
                .email("email")
                .xTraceId("X-Trace-Id")
                .age(1)
                .build());
    }
}
