package com.snippets;

import com.seed.crossPackageTypeNames.SeedCrossPackageTypeNamesClient;

public class Example0 {
    public static void run() {
        SeedCrossPackageTypeNamesClient client = SeedCrossPackageTypeNamesClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.folderA().service().getDirectThread();
    }
}