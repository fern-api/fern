package com.snippets;

import com.seed.nullableOptional.SeedNullableOptionalClient;
import com.seed.nullableOptional.resources.nullableoptional.requests.SearchRequest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;

public class Example12 {
    public static void main(String[] args) {
        SeedNullableOptionalClient client = SeedNullableOptionalClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.nullableOptional().getSearchResults(
            SearchRequest
                .builder()
                .query("query")
                .filters(
                    new HashMap<String, Optional<String>>() {{
                        put("filters", Optional.of("filters"));
                    }}
                )
                .includeTypes(
                    new ArrayList<String>(
                        Arrays.asList("includeTypes", "includeTypes")
                    )
                )
                .build()
        );
    }
}