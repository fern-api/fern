package com.snippets;

import com.seed.nullableOptional.SeedNullableOptionalClient;
import com.seed.nullableOptional.core.OptionalNullable;
import com.seed.nullableOptional.resources.nullableoptional.types.Address;
import com.seed.nullableOptional.resources.nullableoptional.types.UpdateUserRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedNullableOptionalClient client =
                SeedNullableOptionalClient.builder().url("https://api.fern.com").build();

        client.nullableOptional()
                .updateUser(
                        "userId",
                        UpdateUserRequest.builder()
                                .email(OptionalNullable.of("email"))
                                .address(OptionalNullable.of(Address.builder()
                                        .street("street")
                                        .zipCode("zipCode")
                                        .country(OptionalNullable.of("country"))
                                        .city("city")
                                        .state("state")
                                        .buildingId("buildingId")
                                        .tenantId("tenantId")
                                        .build()))
                                .username("username")
                                .phone("phone")
                                .build());
    }
}
