package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.complex.types.SearchRequest;
import com.seed.pagination.resources.complex.types.SearchRequestQuery;
import com.seed.pagination.resources.complex.types.SingleFilterSearchRequest;
import com.seed.pagination.resources.complex.types.SingleFilterSearchRequestOperator;
import com.seed.pagination.resources.complex.types.StartingAfterPaging;

public class Example0 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.complex()
                .search(
                        "index",
                        SearchRequest.builder()
                                .query(SearchRequestQuery.of(SingleFilterSearchRequest.builder()
                                        .field("field")
                                        .operator(SingleFilterSearchRequestOperator.EQUALS)
                                        .value("value")
                                        .build()))
                                .pagination(StartingAfterPaging.builder()
                                        .perPage(1)
                                        .startingAfter("starting_after")
                                        .build())
                                .build());
    }
}
