package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.testgroup.requests.TestMethodNameTestGroupRequest;
import java.util.Optional;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.testGroup()
                .testMethodName(
                        "path_param",
                        TestMethodNameTestGroupRequest.builder()
                                .body(Optional.empty())
                                .build());
    }
}
