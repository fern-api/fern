package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.complex.requests.SearchRequest;
import com.seed.api.types.SearchRequestQuery;
import com.seed.api.types.SingleFilterSearchRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.complex()
                .search(
                        "index",
                        SearchRequest.builder()
                                .query(SearchRequestQuery.of(
                                        SingleFilterSearchRequest.builder().build()))
                                .build());
    }
}
