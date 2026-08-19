package com.snippets;

import com.seed.nullableOptional.SeedNullableOptionalClient;
import com.seed.nullableOptional.core.OptionalNullable;
import com.seed.nullableOptional.resources.nullableoptional.types.Address;
import com.seed.nullableOptional.resources.nullableoptional.types.DeserializationTestRequest;
import com.seed.nullableOptional.resources.nullableoptional.types.EmailNotification;
import com.seed.nullableOptional.resources.nullableoptional.types.NotificationMethod;
import com.seed.nullableOptional.resources.nullableoptional.types.Organization;
import com.seed.nullableOptional.resources.nullableoptional.types.SearchResult;
import com.seed.nullableOptional.resources.nullableoptional.types.UserResponse;
import com.seed.nullableOptional.resources.nullableoptional.types.UserRole;
import com.seed.nullableOptional.resources.nullableoptional.types.UserStatus;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;

public class Example8 {
    public static void main(String[] args) {
        SeedNullableOptionalClient client =
                SeedNullableOptionalClient.builder().url("https://api.fern.com").build();

        client.nullableOptional()
                .testDeserialization(DeserializationTestRequest.builder()
                        .requiredString("requiredString")
                        .nullableString(OptionalNullable.of("nullableString"))
                        .optionalString("optionalString")
                        .optionalNullableString(OptionalNullable.of("optionalNullableString"))
                        .nullableEnum(OptionalNullable.of(UserRole.ADMIN))
                        .optionalEnum(UserStatus.ACTIVE)
                        .nullableUnion(OptionalNullable.of(NotificationMethod.email(EmailNotification.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .htmlContent("htmlContent")
                                .build())))
                        .optionalUnion(SearchResult.user(UserResponse.builder()
                                .id("id")
                                .username("username")
                                .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .email(OptionalNullable.of("email"))
                                .phone("phone")
                                .updatedAt(OptionalNullable.of(OffsetDateTime.parse("2024-01-15T09:30:00Z")))
                                .address(Address.builder()
                                        .street("street")
                                        .zipCode("zipCode")
                                        .city(OptionalNullable.of("city"))
                                        .state("state")
                                        .country(OptionalNullable.of("country"))
                                        .buildingId(OptionalNullable.of("buildingId"))
                                        .tenantId("tenantId")
                                        .build())
                                .build()))
                        .nullableList(OptionalNullable.of(Arrays.asList("nullableList", "nullableList")))
                        .nullableMap(OptionalNullable.of(new HashMap<String, Integer>() {
                            {
                                put("nullableMap", 1);
                            }
                        }))
                        .nullableObject(OptionalNullable.of(Address.builder()
                                .street("street")
                                .zipCode("zipCode")
                                .city(OptionalNullable.of("city"))
                                .state("state")
                                .country(OptionalNullable.of("country"))
                                .buildingId(OptionalNullable.of("buildingId"))
                                .tenantId("tenantId")
                                .build()))
                        .optionalObject(Organization.builder()
                                .id("id")
                                .name("name")
                                .domain(OptionalNullable.of("domain"))
                                .employeeCount(1)
                                .build())
                        .build());
    }
}
