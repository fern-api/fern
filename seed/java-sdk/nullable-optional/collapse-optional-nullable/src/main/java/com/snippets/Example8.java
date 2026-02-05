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
                        .optionalString(OptionalNullable.of("optionalString"))
                        .optionalNullableString(OptionalNullable.of("optionalNullableString"))
                        .nullableEnum(OptionalNullable.of(UserRole.ADMIN))
                        .optionalEnum(OptionalNullable.of(UserStatus.ACTIVE))
                        .nullableUnion(OptionalNullable.of(NotificationMethod.email(EmailNotification.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .htmlContent(OptionalNullable.of("htmlContent"))
                                .build())))
                        .optionalUnion(OptionalNullable.of(SearchResult.user(UserResponse.builder()
                                .id("id")
                                .username("username")
                                .email(OptionalNullable.of("email"))
                                .phone(OptionalNullable.of("phone"))
                                .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .updatedAt(OptionalNullable.of(OffsetDateTime.parse("2024-01-15T09:30:00Z")))
                                .address(OptionalNullable.of(Address.builder()
                                        .street("street")
                                        .city(OptionalNullable.of("city"))
                                        .state(OptionalNullable.of("state"))
                                        .zipCode("zipCode")
                                        .country(OptionalNullable.of("country"))
                                        .buildingId(OptionalNullable.of("buildingId"))
                                        .tenantId(OptionalNullable.of("tenantId"))
                                        .build()))
                                .build())))
                        .nullableList(OptionalNullable.of(Arrays.asList("nullableList", "nullableList")))
                        .nullableMap(OptionalNullable.of(new HashMap<String, Integer>() {
                            {
                                put("nullableMap", 1);
                            }
                        }))
                        .nullableObject(OptionalNullable.of(Address.builder()
                                .street("street")
                                .city(OptionalNullable.of("city"))
                                .state(OptionalNullable.of("state"))
                                .zipCode("zipCode")
                                .country(OptionalNullable.of("country"))
                                .buildingId(OptionalNullable.of("buildingId"))
                                .tenantId(OptionalNullable.of("tenantId"))
                                .build()))
                        .optionalObject(OptionalNullable.of(Organization.builder()
                                .id("id")
                                .name("name")
                                .domain(OptionalNullable.of("domain"))
                                .employeeCount(OptionalNullable.of(1))
                                .build()))
                        .build());
    }
}
