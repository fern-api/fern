package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.core.OptionalNullable;
import com.seed.api.resources.nullableoptional.requests.UpdateUserRequest;
import com.seed.api.types.Address;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .updateuser(
                        "userId",
                        UpdateUserRequest.builder()
                                .username(OptionalNullable.of("username"))
                                .email(OptionalNullable.of("email"))
                                .phone(OptionalNullable.of("phone"))
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
