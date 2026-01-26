package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.GetItemRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.getItem("key", GetItemRequest.builder().build());
    }
}
