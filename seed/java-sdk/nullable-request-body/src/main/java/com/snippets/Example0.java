package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.testgroup.requests.TestGroupTestMethodNameRequest;
import java.util.Optional;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.testgroup()
                .testMethodName(
                        "path_param",
                        TestGroupTestMethodNameRequest.builder()
                                .body(Optional.empty())
                                .build());
    }
}
