package com.snippets;

import com.seed.cross.package.type.names.SeedCrossPackageTypeNamesClient;

public class Example1 {
    public static void run() {
        SeedCrossPackageTypeNamesClient client = SeedCrossPackageTypeNamesClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.folderA().service().getDirectThread();
    }
}