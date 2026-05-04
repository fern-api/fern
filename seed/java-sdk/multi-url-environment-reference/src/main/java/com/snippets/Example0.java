package com.snippets;

import com.seed.api.SeedApiClient;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder().token("<token>").build();

        client.items().listItems();
    }
}
