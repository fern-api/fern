package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.UnionStreamRequestBase;

public class Example28 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.validateUnionRequest(
                UnionStreamRequestBase.builder().prompt("prompt").build());
    }
}
