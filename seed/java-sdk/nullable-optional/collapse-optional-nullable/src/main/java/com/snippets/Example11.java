package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.core.OptionalNullable;
import com.seed.api.types.Address;
import com.seed.api.types.ComplexProfile;
import com.seed.api.types.NotificationMethod;
import com.seed.api.types.NotificationMethodZero;
import com.seed.api.types.NotificationMethodZeroType;
import com.seed.api.types.SearchResult;
import com.seed.api.types.SearchResultZero;
import com.seed.api.types.SearchResultZeroType;
import com.seed.api.types.UserRole;
import com.seed.api.types.UserStatus;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;

public class Example11 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .createcomplexprofile(ComplexProfile.builder()
                        .id("id")
                        .nullableRole(UserRole.ADMIN)
                        .nullableStatus(UserStatus.ACTIVE)
                        .nullableNotification(NotificationMethod.of(NotificationMethodZero.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .htmlContent(OptionalNullable.of("htmlContent"))
                                .type(NotificationMethodZeroType.EMAIL)
                                .build()))
                        .nullableSearchResult(SearchResult.of(SearchResultZero.builder()
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
                        .optionalArray(OptionalNullable.of(Arrays.asList("optionalArray", "optionalArray")))
                        .optionalNullableArray(
                                OptionalNullable.of(Arrays.asList("optionalNullableArray", "optionalNullableArray")))
                        .optionalMapOfEnums(OptionalNullable.of(new HashMap<String, Optional<UserRole>>() {
                            {
                                put("optionalMapOfEnums", Optional.of(UserRole.ADMIN));
                            }
                        }))
                        .optionalRole(UserRole.ADMIN)
                        .optionalNullableRole(UserRole.ADMIN)
                        .optionalStatus(UserStatus.ACTIVE)
                        .optionalNullableStatus(UserStatus.ACTIVE)
                        .optionalNotification(NotificationMethod.of(NotificationMethodZero.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .htmlContent(OptionalNullable.of("htmlContent"))
                                .type(NotificationMethodZeroType.EMAIL)
                                .build()))
                        .optionalNullableNotification(NotificationMethod.of(NotificationMethodZero.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .htmlContent(OptionalNullable.of("htmlContent"))
                                .type(NotificationMethodZeroType.EMAIL)
                                .build()))
                        .optionalSearchResult(SearchResult.of(SearchResultZero.builder()
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
                        .nullableArray(Optional.of(Arrays.asList("nullableArray", "nullableArray")))
                        .nullableListOfNullables(Optional.of(Arrays.asList(
                                Optional.of("nullableListOfNullables"), Optional.of("nullableListOfNullables"))))
                        .nullableMapOfNullables(new HashMap<String, Optional<Address>>() {
                            {
                                put(
                                        "nullableMapOfNullables",
                                        Optional.of(Address.builder()
                                                .street("street")
                                                .state(OptionalNullable.of("state"))
                                                .zipCode("zipCode")
                                                .country(OptionalNullable.of("country"))
                                                .city(Optional.of("city"))
                                                .buildingId(Optional.of("buildingId"))
                                                .tenantId(Optional.of("tenantId"))
                                                .build()));
                            }
                        })
                        .nullableListOfUnions(Optional.of(Arrays.asList(
                                NotificationMethod.of(NotificationMethodZero.builder()
                                        .emailAddress("emailAddress")
                                        .subject("subject")
                                        .htmlContent(OptionalNullable.of("htmlContent"))
                                        .type(NotificationMethodZeroType.EMAIL)
                                        .build()),
                                NotificationMethod.of(NotificationMethodZero.builder()
                                        .emailAddress("emailAddress")
                                        .subject("subject")
                                        .htmlContent(OptionalNullable.of("htmlContent"))
                                        .type(NotificationMethodZeroType.EMAIL)
                                        .build()))))
                        .build());
    }
}
