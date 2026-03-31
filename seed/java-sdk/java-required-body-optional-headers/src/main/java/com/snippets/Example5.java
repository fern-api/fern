package com.snippets;

import com.seed.javaRequiredBodyOptionalHeaders.SeedJavaRequiredBodyOptionalHeadersClient;
import com.seed.javaRequiredBodyOptionalHeaders.requests.GetUsersRequest;

public class Example5 {
    public static void main(String[] args) {
        SeedJavaRequiredBodyOptionalHeadersClient client = SeedJavaRequiredBodyOptionalHeadersClient.builder()
                .url("https://api.fern.com")
                .build();

        client.getUsers(GetUsersRequest.builder().limit(1).build());
    }
}
