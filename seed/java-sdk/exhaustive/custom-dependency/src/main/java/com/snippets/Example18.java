package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.resources.types.object.types.NestedObjectWithOptionalField;
import com.seed.exhaustive.resources.types.object.types.ObjectWithOptionalField;
import java.math.BigInteger;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.UUID;

public class Example18 {
    public static void run() {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().getAndReturnNestedWithOptionalField(
            NestedObjectWithOptionalField
                .builder()
                .string("string")
                .nestedObject(
                    ObjectWithOptionalField
                        .builder()
                        .string("string")
                        .integer(1)
                        .long_(1000000L)
                        .double_(1.1)
                        .bool(true)
                        .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .date("2023-01-15")
                        .uuid(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                        .base64("SGVsbG8gd29ybGQh".getBytes())
                        .list(
                            new ArrayList<String>(
                                Arrays.asList("list", "list")
                            )
                        )
                        .set(
                            new HashSet<String>(
                                Arrays.asList("set")
                            )
                        )
                        .map(
                            new HashMap<Integer, String>() {{
                                put(1, "map");
                            }}
                        )
                        .bigint(new BigInteger("1000000"))
                        .build()
                )
                .build()
        );
    }
}