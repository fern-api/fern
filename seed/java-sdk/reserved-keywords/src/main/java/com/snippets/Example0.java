package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.package_.requests.PackageTestRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.package_().test(PackageTestRequest.builder().for_("for").build());
    }
}
