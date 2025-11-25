package com.snippets;

import com.seed.nullableOptional.SeedNullableOptionalClient;
import com.seed.nullableOptional.core.OptionalNullable;
import com.seed.nullableOptional.resources.nullableoptional.requests.ListUsersRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedNullableOptionalClient client =
                SeedNullableOptionalClient.builder().url("https://api.fern.com").build();

        client.nullableOptional()
                .listUsers(ListUsersRequest.builder()
                        .limit(OptionalNullable.of(1))
                        .offset(OptionalNullable.of(1))
                        .includeDeleted(OptionalNullable.of(true))
                        .sortBy(OptionalNullable.of("sortBy"))
                        .build());
    }
}
