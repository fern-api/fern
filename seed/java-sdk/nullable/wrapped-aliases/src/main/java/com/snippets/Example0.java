package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.nullable.requests.NullableGetUsersRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullable().getusers(NullableGetUsersRequest.builder().build());
    }
}
