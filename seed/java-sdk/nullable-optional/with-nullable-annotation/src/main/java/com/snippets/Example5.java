package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.nullableoptional.requests.NullableOptionalListUsersRequest;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .listusers(NullableOptionalListUsersRequest.builder()
                        .limit(1)
                        .offset(1)
                        .includeDeleted(true)
                        .sortBy("sortBy")
                        .build());
    }
}
