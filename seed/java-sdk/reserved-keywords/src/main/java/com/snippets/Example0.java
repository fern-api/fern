package com.snippets;

import com.seed.nurseryApi.SeedNurseryApiClient;
import com.seed.nurseryApi.resources.package_.requests.TestRequest;

public class Example0 {
    public static void main(String[] args) {
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