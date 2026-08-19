package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.TreeRecord;

public class Example12 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.createTree(TreeRecord.builder().id("id").build());
    }
}
