package com.snippets;

import com.seed.nullableOptional.SeedNullableOptionalClient;
import com.seed.nullableOptional.core.OptionalNullable;
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
                        .nullableRole(OptionalNullable.of(UserRole.ADMIN))
                        .optionalRole(UserRole.ADMIN)
                        .optionalNullableRole(OptionalNullable.of(UserRole.ADMIN))
                        .nullableStatus(OptionalNullable.of(UserStatus.ACTIVE))
                        .optionalStatus(UserStatus.ACTIVE)
                        .optionalNullableStatus(OptionalNullable.of(UserStatus.ACTIVE))
                        .nullableNotification(OptionalNullable.of(NotificationMethod.email(EmailNotification.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .htmlContent("htmlContent")
                                .build())))
                        .optionalNotification(NotificationMethod.email(EmailNotification.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .htmlContent("htmlContent")
                                .build()))
                        .optionalNullableNotification(
                                OptionalNullable.of(NotificationMethod.email(EmailNotification.builder()
                                        .emailAddress("emailAddress")
                                        .subject("subject")
                                        .htmlContent("htmlContent")
                                        .build())))
                        .nullableSearchResult(OptionalNullable.of(SearchResult.user(UserResponse.builder()
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
                                .build())))
                        .optionalSearchResult(SearchResult.user(UserResponse.builder()
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
                        .nullableArray(OptionalNullable.of(Arrays.asList("nullableArray", "nullableArray")))
                        .optionalArray(Optional.of(Arrays.asList("optionalArray", "optionalArray")))
                        .optionalNullableArray(
                                OptionalNullable.of(Arrays.asList("optionalNullableArray", "optionalNullableArray")))
                        .nullableListOfNullables(OptionalNullable.of(Arrays.asList(
                                OptionalNullable.of("nullableListOfNullables"),
                                OptionalNullable.of("nullableListOfNullables"))))
                        .nullableMapOfNullables(OptionalNullable.of(new HashMap<String, OptionalNullable<Address>>() {
                            {
                                put(
                                        "nullableMapOfNullables",
                                        OptionalNullable.of(Address.builder()
                                                .street("street")
                                                .zipCode("zipCode")
                                                .city(OptionalNullable.of("city"))
                                                .state(Optional.of("state"))
                                                .country(OptionalNullable.of("country"))
                                                .buildingId(OptionalNullable.of("buildingId"))
                                                .tenantId(Optional.of("tenantId"))
                                                .build()));
                            }
                        }))
                        .nullableListOfUnions(OptionalNullable.of(Arrays.asList(
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
