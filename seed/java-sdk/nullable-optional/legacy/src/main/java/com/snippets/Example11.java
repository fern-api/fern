package com.snippets;

import com.seed.nullableOptional.SeedNullableOptionalClient;
import com.seed.nullableOptional.resources.nullableoptional.requests.UpdateTagsRequest;
import java.util.Arrays;
import java.util.Optional;

public class Example11 {
    public static void main(String[] args) {
        SeedNullableOptionalClient client =
                SeedNullableOptionalClient.builder().url("https://api.fern.com").build();

        client.nullableOptional()
                .updateTags(
                        "userId",
                        UpdateTagsRequest.builder()
                                .tags(Optional.of(Arrays.asList("tags", "tags")))
                                .categories(Optional.of(Arrays.asList("categories", "categories")))
                                .labels(Optional.of(Arrays.asList("labels", "labels")))
                                .build());
    }
}
