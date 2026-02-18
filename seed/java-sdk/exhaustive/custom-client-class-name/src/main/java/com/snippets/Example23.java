package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.endpoints.pagination.requests.ListItemsRequest;

public class Example23 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .pagination()
                .listItems(ListItemsRequest.builder().cursor("cursor").limit(1).build());
    }
}
