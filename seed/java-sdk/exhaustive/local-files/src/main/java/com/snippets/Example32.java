package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.endpoints.pagination.requests.ListItemsRequest;

public class Example32 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().pagination().listItems(
            ListItemsRequest
                .builder()
                .cursor("cursor")
                .limit(1)
                .build()
        );
    }
}