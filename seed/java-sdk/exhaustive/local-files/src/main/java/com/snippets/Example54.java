package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.endpointspagination.requests.EndpointsPaginationListItemsRequest;

public class Example54 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsPagination().endpointsPaginationListItems(
            EndpointsPaginationListItemsRequest
                .builder()
                .build()
        );
    }
}