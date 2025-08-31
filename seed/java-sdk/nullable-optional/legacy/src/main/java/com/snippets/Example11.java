package com.snippets;

import com.seed.nullableOptional.SeedNullableOptionalClient;
import com.seed.nullableOptional.resources.nullableoptional.requests.UpdateTagsRequest;
import java.util.ArrayList;
import java.util.Arrays;

public class Example11 {
    public static void main(String[] args) {
        SeedNullableOptionalClient client = SeedNullableOptionalClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.nullableOptional().updateTags(
            "userId",
            UpdateTagsRequest
                .builder()
                .tags(
                    new ArrayList<String>(
                        Arrays.asList("tags", "tags")
                    )
                )
                .categories(
                    new ArrayList<String>(
                        Arrays.asList("categories", "categories")
                    )
                )
                .labels(
                    new ArrayList<String>(
                        Arrays.asList("labels", "labels")
                    )
                )
                .build()
        );
    }
}