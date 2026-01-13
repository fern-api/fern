package com.snippets;

import com.seed.nullableOptional.SeedNullableOptionalClient;
import com.seed.nullableOptional.resources.nullableoptional.types.Address;
import com.seed.nullableOptional.resources.nullableoptional.types.CreateUserRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedNullableOptionalClient client =
                SeedNullableOptionalClient.builder().url("https://api.fern.com").build();

        client.nullableOptional()
                .createUser(CreateUserRequest.builder()
                        .username("username")
                        .email("email")
                        .phone("phone")
                        .address(Address.builder()
                                .street("street")
                                .zipCode("zipCode")
                                .city("city")
                                .state("state")
                                .country("country")
                                .buildingId("buildingId")
                                .tenantId("tenantId")
                                .build())
                        .build());
    }
}
