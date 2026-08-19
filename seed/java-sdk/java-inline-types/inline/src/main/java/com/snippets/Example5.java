package com.snippets;

import com.seed.object.SeedObjectClient;

public class Example5 {
    public static void main(String[] args) {
        SeedObjectClient client =
                SeedObjectClient.builder().url("https://api.fern.com").build();

        client.getOrphanParent();
    }
}
