package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.core.OptionalNullable;
import com.seed.api.resources.nullableoptional.requests.CreateUserRequest;
import com.seed.api.types.Address;

public class Example7 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .createuser(CreateUserRequest.builder()
                        .username("username")
                        .phone(OptionalNullable.of("phone"))
                        .email("email")
                        .address(Address.builder()
                                .street("street")
                                .state(OptionalNullable.of("state"))
                                .zipCode("zipCode")
                                .country(OptionalNullable.of("country"))
                                .city("city")
                                .buildingId("buildingId")
                                .tenantId("tenantId")
                                .build())
                        .build());
    }
}
