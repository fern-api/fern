package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.nullableoptional.requests.NullableOptionalSearchUsersRequest;

public class Example8 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .searchusers(NullableOptionalSearchUsersRequest.builder()
                        .query("query")
                        .department("department")
                        .build());
    }
}
