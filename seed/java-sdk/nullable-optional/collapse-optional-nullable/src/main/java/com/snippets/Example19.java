package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.nullableoptional.requests.NullableOptionalFilterByRoleRequest;
import com.seed.api.types.UserRole;
import com.seed.api.types.UserStatus;

public class Example19 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .filterbyrole(NullableOptionalFilterByRoleRequest.builder()
                        .role(UserRole.ADMIN)
                        .status(UserStatus.ACTIVE)
                        .secondaryRole(UserRole.ADMIN)
                        .build());
    }
}
