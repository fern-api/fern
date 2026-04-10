package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpointspagination.requests.EndpointsPaginationListItemsRequest;

public class Example55 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsPagination()
                .endpointsPaginationListItems(EndpointsPaginationListItemsRequest.builder()
                        .cursor("cursor")
                        .limit(1)
                        .build());
    }
}
