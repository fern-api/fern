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
                        .sortBy(OptionalNullable.of("sortBy"))
                        .limit(1)
                        .offset(1)
                        .includeDeleted(true)
                        .build());
    }
}
