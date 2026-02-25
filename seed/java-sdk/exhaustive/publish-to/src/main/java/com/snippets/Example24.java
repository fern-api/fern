package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.resources.endpoints.pagination.requests.ListItemsRequest;

public class Example24 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .pagination()
                .listItems(ListItemsRequest.builder().cursor("cursor").limit(1).build());
    }
}
