package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.vendor.requests.CreateVendorRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.vendor().createVendor(CreateVendorRequest.builder().name("name").build());
    }
}
