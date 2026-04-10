package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.nullableoptional.requests.NullableOptionalFilterByRoleRequest;
import com.seed.api.types.UserRole;

public class Example18 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .filterbyrole(NullableOptionalFilterByRoleRequest.builder()
                        .role(UserRole.ADMIN)
                        .build());
    }
}
