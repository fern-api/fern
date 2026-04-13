package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.nullableoptional.requests.NullableOptionalGetSearchResultsRequest;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;

public class Example25 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .getsearchresults(NullableOptionalGetSearchResultsRequest.builder()
                        .query("query")
                        .includeTypes(Optional.of(Arrays.asList("includeTypes", "includeTypes")))
                        .filters(new HashMap<String, Optional<String>>() {
                            {
                                put("filters", Optional.of("filters"));
                            }
                        })
                        .build());
    }
}
