package com.snippets;

import com.seed.crossPackageTypeNames.SeedCrossPackageTypeNamesClient;

public class Example1 {
    public static void main(String[] args) {
        SeedCrossPackageTypeNamesClient client = SeedCrossPackageTypeNamesClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.folderA().service().getDirectThread();
    }
}