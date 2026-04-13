package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.core.OptionalNullable;
import com.seed.api.resources.nullableoptional.requests.NullableOptionalSearchUsersRequest;

public class Example9 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .searchusers(NullableOptionalSearchUsersRequest.builder()
                        .query("query")
                        .role(OptionalNullable.of("role"))
                        .isActive(OptionalNullable.of(true))
                        .department("department")
                        .build());
    }
}
