package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.core.OptionalNullable;
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
                                .categories(OptionalNullable.of(Arrays.asList("categories", "categories")))
                                .labels(OptionalNullable.of(Arrays.asList("labels", "labels")))
                                .tags(Optional.of(Arrays.asList("tags", "tags")))
                                .build());
    }
}
