package com.snippets;

import com.seed.nursery.api.SeedNurseryApiClient;
import com.seed.nursery.api.resources.package_.requests.TestRequest;

public class Example0 {
    public static void run() {
        SeedNurseryApiClient client = SeedNurseryApiClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.package_().test(
            TestRequest
                .builder()
                .for_("for")
                .build()
        );
    }
}