package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.TreeRecord;

public class Example13 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.createTree(TreeRecord.builder()
                .id("id")
                .treeName("treeName")
                .treeSpecies("treeSpecies")
                .treeDescription("treeDescription")
                .heightInFeet(1.1)
                .plantedDate("2023-01-15")
                .build());
    }
}
