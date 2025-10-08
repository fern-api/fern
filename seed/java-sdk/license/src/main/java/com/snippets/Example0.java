package com.snippets;

import com.seed.license.SeedLicenseClient;

public class Example0 {
    public static void main(String[] args) {
        SeedLicenseClient client =
                SeedLicenseClient.builder().url("https://api.fern.com").build();

        client.get();
    }
}
