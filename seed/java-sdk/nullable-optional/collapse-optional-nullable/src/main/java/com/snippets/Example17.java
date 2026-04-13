package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.core.OptionalNullable;
import com.seed.api.types.Address;
import com.seed.api.types.DeserializationTestRequest;
import com.seed.api.types.NotificationMethod;
import com.seed.api.types.NotificationMethodZero;
import com.seed.api.types.NotificationMethodZeroType;
import com.seed.api.types.Organization;
import com.seed.api.types.SearchResult;
import com.seed.api.types.SearchResultZero;
import com.seed.api.types.SearchResultZeroType;
import com.seed.api.types.UserRole;
import com.seed.api.types.UserStatus;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;

public class Example17 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .testdeserialization(DeserializationTestRequest.builder()
                        .requiredString("requiredString")
                        .optionalString(OptionalNullable.of("optionalString"))
                        .optionalNullableString(OptionalNullable.of("optionalNullableString"))
                        .nullableEnum(UserRole.ADMIN)
                        .nullableUnion(NotificationMethod.of(NotificationMethodZero.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .htmlContent(OptionalNullable.of("htmlContent"))
                                .type(NotificationMethodZeroType.EMAIL)
                                .build()))
                        .nullableObject(Address.builder()
                                .street("street")
                                .state(OptionalNullable.of("state"))
                                .zipCode("zipCode")
                                .country(OptionalNullable.of("country"))
                                .city("city")
                                .buildingId("buildingId")
                                .tenantId("tenantId")
                                .build())
                        .nullableString("nullableString")
                        .optionalEnum(UserStatus.ACTIVE)
                        .optionalUnion(SearchResult.of(SearchResultZero.builder()
                                .id("id")
                                .username("username")
                                .phone(OptionalNullable.of("phone"))
                                .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .type(SearchResultZeroType.USER)
                                .email(Optional.of("email"))
                                .updatedAt(Optional.of(OffsetDateTime.parse("2024-01-15T09:30:00Z")))
                                .address(Optional.of(Address.builder()
                                        .street("street")
                                        .state(OptionalNullable.of("state"))
                                        .zipCode("zipCode")
                                        .country(OptionalNullable.of("country"))
                                        .city(Optional.of("city"))
                                        .buildingId(Optional.of("buildingId"))
                                        .tenantId(Optional.of("tenantId"))
                                        .build()))
                                .build()))
                        .nullableList(Optional.of(Arrays.asList("nullableList", "nullableList")))
                        .nullableMap(new HashMap<String, Optional<Integer>>() {
                            {
                                put("nullableMap", Optional.of(1));
                            }
                        })
                        .optionalObject(Organization.builder()
                                .id("id")
                                .name("name")
                                .employeeCount(OptionalNullable.of(1))
                                .domain("domain")
                                .build())
                        .build());
    }
}
