package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpoints.pagination.requests.ListItemsPaginationRequest;

public class Example62 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().pagination().listItems(
            ListItemsPaginationRequest
                .builder()
                .cursor("cursor")
                .limit(1)
                .build()
        );
    }
}