package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.nullableoptional.requests.NullableOptionalGetComplexProfileRequest;

public class Example12 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .getcomplexprofile(
                        "profileId",
                        NullableOptionalGetComplexProfileRequest.builder().build());
    }
}
