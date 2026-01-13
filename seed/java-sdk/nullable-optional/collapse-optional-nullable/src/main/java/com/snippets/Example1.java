package com.snippets;

import com.seed.nullableOptional.SeedNullableOptionalClient;
import com.seed.nullableOptional.core.OptionalNullable;
import com.seed.nullableOptional.resources.nullableoptional.types.Address;
import com.seed.nullableOptional.resources.nullableoptional.types.CreateUserRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedNullableOptionalClient client =
                SeedNullableOptionalClient.builder().url("https://api.fern.com").build();

        client.nullableOptional()
                .createUser(CreateUserRequest.builder()
                        .username("username")
                        .email(OptionalNullable.of("email"))
                        .phone(OptionalNullable.of("phone"))
                        .address(OptionalNullable.of(Address.builder()
                                .street("street")
                                .city(OptionalNullable.of("city"))
                                .state(OptionalNullable.of("state"))
                                .zipCode("zipCode")
                                .country(OptionalNullable.of("country"))
                                .buildingId(OptionalNullable.of("buildingId"))
                                .tenantId(OptionalNullable.of("tenantId"))
                                .build()))
                        .build());
    }
}
