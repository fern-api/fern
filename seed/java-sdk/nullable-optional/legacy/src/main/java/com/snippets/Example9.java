package com.snippets;

import com.seed.nullableOptional.SeedNullableOptionalClient;
import com.seed.nullableOptional.resources.nullableoptional.requests.FilterByRoleRequest;
import com.seed.nullableOptional.resources.nullableoptional.types.UserRole;
import com.seed.nullableOptional.resources.nullableoptional.types.UserStatus;

public class Example9 {
    public static void main(String[] args) {
        SeedNullableOptionalClient client =
                SeedNullableOptionalClient.builder().url("https://api.fern.com").build();

        client.nullableOptional()
                .filterByRole(FilterByRoleRequest.builder()
                        .role(UserRole.ADMIN)
                        .status(UserStatus.ACTIVE)
                        .secondaryRole(UserRole.ADMIN)
                        .build());
    }
}
