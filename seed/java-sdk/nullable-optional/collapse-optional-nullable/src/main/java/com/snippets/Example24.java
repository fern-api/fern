package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.nullableoptional.requests.NullableOptionalGetSearchResultsRequest;

public class Example24 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .getsearchresults(NullableOptionalGetSearchResultsRequest.builder()
                        .query("query")
                        .build());
    }
}
