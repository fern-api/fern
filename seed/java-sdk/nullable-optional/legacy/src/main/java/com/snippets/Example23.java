package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.nullableoptional.requests.NullableOptionalUpdateTagsRequest;
import java.util.Arrays;
import java.util.Optional;

public class Example23 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .updatetags(
                        "userId",
                        NullableOptionalUpdateTagsRequest.builder()
                                .tags(Optional.of(Arrays.asList("tags", "tags")))
                                .categories(Optional.of(Arrays.asList("categories", "categories")))
                                .labels(Optional.of(Arrays.asList("labels", "labels")))
                                .build());
    }
}
