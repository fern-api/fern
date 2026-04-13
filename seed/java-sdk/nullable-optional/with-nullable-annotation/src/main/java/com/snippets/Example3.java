package com.snippets;

import com.seed.api.SeedApiClient;
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
