package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.complex.requests.SearchRequest;
import com.seed.api.types.SearchRequestQuery;
import com.seed.api.types.SingleFilterSearchRequest;
import com.seed.api.types.SingleFilterSearchRequestOperator;
import com.seed.api.types.StartingAfterPaging;
import java.util.Optional;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.complex()
                .search(
                        "index",
                        SearchRequest.builder()
                                .query(SearchRequestQuery.of(SingleFilterSearchRequest.builder()
                                        .field(Optional.of("field"))
                                        .operator(Optional.of(SingleFilterSearchRequestOperator.EQUAL_TO))
                                        .value(Optional.of("value"))
                                        .build()))
                                .pagination(StartingAfterPaging.builder()
                                        .perPage(1)
                                        .startingAfter("starting_after")
                                        .build())
                                .build());
    }
}
