package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.nullableoptional.requests.NullableOptionalUpdateComplexProfileRequest;

public class Example14 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .updatecomplexprofile(
                        "profileId",
                        NullableOptionalUpdateComplexProfileRequest.builder().build());
    }
}
