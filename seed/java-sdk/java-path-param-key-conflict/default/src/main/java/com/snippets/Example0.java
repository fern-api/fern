package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.CreateItemRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.createItem(
                "key", "value", CreateItemRequest.builder().data("data").build());
    }
}
