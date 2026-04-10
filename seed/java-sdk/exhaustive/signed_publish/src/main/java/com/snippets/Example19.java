package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.TypesObjectWithOptionalField;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;

public class Example19 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsContentType()
                .endpointsContentTypePostJsonPatchContentWithCharsetType(TypesObjectWithOptionalField.builder()
                        .string("string")
                        .integer(1)
                        .long_(1000000L)
                        .double_(1.1)
                        .bool(true)
                        .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .date("2023-01-15")
                        .uuid("uuid")
                        .base64("base64")
                        .list(Optional.of(Arrays.asList("list", "list")))
                        .set(Optional.of(Arrays.asList("set", "set")))
                        .map(new HashMap<String, Optional<String>>() {
                            {
                                put("map", Optional.of("map"));
                            }
                        })
                        .bigint(1)
                        .build());
    }
}
