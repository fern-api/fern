package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpoints.pagination.requests.ListItemsPaginationRequest;

public class Example62 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .pagination()
                .listItems(ListItemsPaginationRequest.builder()
                        .cursor("cursor")
                        .limit(1)
                        .build());
    }
}
