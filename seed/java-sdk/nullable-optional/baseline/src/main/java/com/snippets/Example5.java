package com.snippets;

import com.seed.nullableOptional.SeedNullableOptionalClient;
import com.seed.nullableOptional.resources.nullableoptional.types.Address;
import com.seed.nullableOptional.resources.nullableoptional.types.ComplexProfile;
import com.seed.nullableOptional.resources.nullableoptional.types.EmailNotification;
import com.seed.nullableOptional.resources.nullableoptional.types.NotificationMethod;
import com.seed.nullableOptional.resources.nullableoptional.types.SearchResult;
import com.seed.nullableOptional.resources.nullableoptional.types.UserResponse;
import com.seed.nullableOptional.resources.nullableoptional.types.UserRole;
import com.seed.nullableOptional.resources.nullableoptional.types.UserStatus;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;

public class Example5 {
    public static void main(String[] args) {
        SeedNullableOptionalClient client =
                SeedNullableOptionalClient.builder().url("https://api.fern.com").build();

        client.nullableOptional()
                .createComplexProfile(ComplexProfile.builder()
                        .id("id")
                        .nullableRole(UserRole.ADMIN)
                        .optionalRole(UserRole.ADMIN)
                        .optionalNullableRole(UserRole.ADMIN)
                        .nullableStatus(UserStatus.ACTIVE)
                        .optionalStatus(UserStatus.ACTIVE)
                        .optionalNullableStatus(UserStatus.ACTIVE)
                        .nullableNotification(NotificationMethod.email(EmailNotification.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .htmlContent("htmlContent")
                                .build()))
                        .optionalNotification(NotificationMethod.email(EmailNotification.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .htmlContent("htmlContent")
                                .build()))
                        .optionalNullableNotification(NotificationMethod.email(EmailNotification.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .htmlContent("htmlContent")
                                .build()))
                        .nullableSearchResult(SearchResult.user(UserResponse.builder()
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
                        .optionalSearchResult(SearchResult.user(UserResponse.builder()
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
                        .nullableArray(Optional.of(Arrays.asList("nullableArray", "nullableArray")))
                        .optionalArray(Optional.of(Arrays.asList("optionalArray", "optionalArray")))
                        .optionalNullableArray(
                                Optional.of(Arrays.asList("optionalNullableArray", "optionalNullableArray")))
                        .nullableListOfNullables(Optional.of(Arrays.asList(
                                Optional.of("nullableListOfNullables"), Optional.of("nullableListOfNullables"))))
                        .nullableMapOfNullables(new HashMap<String, Optional<Address>>() {
                            {
                                put(
                                        "nullableMapOfNullables",
                                        Optional.of(Address.builder()
                                                .street("street")
                                                .zipCode("zipCode")
                                                .city(Optional.of("city"))
                                                .state(Optional.of("state"))
                                                .country(Optional.of("country"))
                                                .buildingId(Optional.of("buildingId"))
                                                .tenantId(Optional.of("tenantId"))
                                                .build()));
                            }
                        })
                        .nullableListOfUnions(Optional.of(Arrays.asList(
                                NotificationMethod.email(EmailNotification.builder()
                                        .emailAddress("emailAddress")
                                        .subject("subject")
                                        .htmlContent("htmlContent")
                                        .build()),
                                NotificationMethod.email(EmailNotification.builder()
                                        .emailAddress("emailAddress")
                                        .subject("subject")
                                        .htmlContent("htmlContent")
                                        .build()))))
                        .optionalMapOfEnums(new HashMap<String, UserRole>() {
                            {
                                put("optionalMapOfEnums", UserRole.ADMIN);
                            }
                        })
                        .build());
    }
}
