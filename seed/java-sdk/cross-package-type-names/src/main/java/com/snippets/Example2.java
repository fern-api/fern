package com.snippets;

import com.seed.crossPackageTypeNames.SeedCrossPackageTypeNamesClient;
import com.seed.crossPackageTypeNames.resources.foo.requests.FindRequest;

public class Example2 {
    public static void run() {
        SeedCrossPackageTypeNamesClient client = SeedCrossPackageTypeNamesClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.foo().find(
            FindRequest
                .builder()
                .optionalString("optionalString")
                .publicProperty("publicProperty")
                .privateProperty(1)
                .build()
        );
    }
}