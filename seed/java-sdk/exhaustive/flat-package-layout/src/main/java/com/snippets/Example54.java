package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.EndpointsPaginationListItemsRequest;

public class Example54 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsPagination()
                .endpointsPaginationListItems(
                        EndpointsPaginationListItemsRequest.builder().build());
    }
}
