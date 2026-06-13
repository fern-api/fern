package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.TestGetViaOverridesRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.testGetViaOverrides(
                "region", TestGetViaOverridesRequest.builder().limit("limit").build());
    }
}
