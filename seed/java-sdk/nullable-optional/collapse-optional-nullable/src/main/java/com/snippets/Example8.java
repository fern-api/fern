package com.snippets;

import com.seed.nullableOptional.SeedNullableOptionalClient;
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
import java.util.Optional;

public class Example8 {
    public static void main(String[] args) {
        SeedNullableOptionalClient client =
                SeedNullableOptionalClient.builder().url("https://api.fern.com").build();

        client.nullableOptional()
                .testDeserialization(DeserializationTestRequest.builder()
                        .requiredString("requiredString")
                        .nullableString("nullableString")
                        .optionalString("optionalString")
                        .optionalNullableString("optionalNullableString")
                        .nullableEnum(UserRole.ADMIN)
                        .optionalEnum(UserStatus.ACTIVE)
                        .nullableUnion(NotificationMethod.email(EmailNotification.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .htmlContent("htmlContent")
                                .build()))
                        .optionalUnion(SearchResult.user(UserResponse.builder()
                                .id("id")
                                .username("username")
                                .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .email("email")
                                .phone("phone")
                                .updatedAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .address(Address.builder()
                                        .street("street")
                                        .zipCode("zipCode")
                                        .city("city")
                                        .state("state")
                                        .country("country")
                                        .buildingId("buildingId")
                                        .tenantId("tenantId")
                                        .build())
                                .build()))
                        .nullableList(Optional.of(Arrays.asList("nullableList", "nullableList")))
                        .nullableMap(new HashMap<String, Integer>() {
                            {
                                put("nullableMap", 1);
                            }
                        })
                        .nullableObject(Address.builder()
                                .street("street")
                                .zipCode("zipCode")
                                .city("city")
                                .state("state")
                                .country("country")
                                .buildingId("buildingId")
                                .tenantId("tenantId")
                                .build())
                        .optionalObject(Organization.builder()
                                .id("id")
                                .name("name")
                                .domain("domain")
                                .employeeCount(1)
                                .build())
                        .build());
    }
}
