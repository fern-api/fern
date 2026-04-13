package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.core.OptionalNullable;
import com.seed.api.resources.nullableoptional.requests.NullableOptionalListUsersRequest;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .listusers(NullableOptionalListUsersRequest.builder()
                        .limit(OptionalNullable.of(1))
                        .offset(OptionalNullable.of(1))
                        .includeDeleted(OptionalNullable.of(true))
                        .sortBy(OptionalNullable.of("sortBy"))
                        .build());
    }
}
