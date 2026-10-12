package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.items.requests.CreateItemRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.items().createItem(CreateItemRequest.builder().name("name").build());
    }
}
