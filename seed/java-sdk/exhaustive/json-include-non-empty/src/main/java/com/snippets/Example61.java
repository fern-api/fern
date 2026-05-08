package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpoints.pagination.requests.ListItemsPaginationRequest;

public class Example61 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .pagination()
                .listItems(ListItemsPaginationRequest.builder().build());
    }
}
