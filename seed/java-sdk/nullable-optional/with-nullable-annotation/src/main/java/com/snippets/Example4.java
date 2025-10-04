package com.snippets;

import com.seed.nullableOptional.SeedNullableOptionalClient;
import com.seed.nullableOptional.resources.nullableoptional.requests.SearchUsersRequest;

public class Example4 {
    public static void main(String[] args) {
        SeedNullableOptionalClient client =
                SeedNullableOptionalClient.builder().url("https://api.fern.com").build();

        client.nullableOptional()
                .searchUsers(SearchUsersRequest.builder()
                        .query("query")
                        .department("department")
                        .role("role")
                        .isActive(true)
                        .build());
    }
}
