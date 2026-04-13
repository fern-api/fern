package com.snippets;

import com.seed.api.SeedApiClient;
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
                                .type(NotificationMethodZeroType.EMAIL)
                                .htmlContent(Optional.of("htmlContent"))
                                .build()))
                        .nullableSearchResult(SearchResult.of(SearchResultZero.builder()
                                .id("id")
                                .username("username")
                                .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .type(SearchResultZeroType.USER)
                                .email(Optional.of("email"))
                                .phone(Optional.of("phone"))
                                .updatedAt(Optional.of(OffsetDateTime.parse("2024-01-15T09:30:00Z")))
                                .address(Optional.of(Address.builder()
                                        .street("street")
                                        .zipCode("zipCode")
                                        .city(Optional.of("city"))
                                        .state(Optional.of("state"))
                                        .country(Optional.of("country"))
                                        .buildingId(Optional.of("buildingId"))
                                        .tenantId(Optional.of("tenantId"))
                                        .build()))
                                .build()))
                        .optionalRole(UserRole.ADMIN)
                        .optionalNullableRole(UserRole.ADMIN)
                        .optionalStatus(UserStatus.ACTIVE)
                        .optionalNullableStatus(UserStatus.ACTIVE)
                        .optionalNotification(NotificationMethod.of(NotificationMethodZero.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .type(NotificationMethodZeroType.EMAIL)
                                .htmlContent(Optional.of("htmlContent"))
                                .build()))
                        .optionalNullableNotification(NotificationMethod.of(NotificationMethodZero.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .type(NotificationMethodZeroType.EMAIL)
                                .htmlContent(Optional.of("htmlContent"))
                                .build()))
                        .optionalSearchResult(SearchResult.of(SearchResultZero.builder()
                                .id("id")
                                .username("username")
                                .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .type(SearchResultZeroType.USER)
                                .email(Optional.of("email"))
                                .phone(Optional.of("phone"))
                                .updatedAt(Optional.of(OffsetDateTime.parse("2024-01-15T09:30:00Z")))
                                .address(Optional.of(Address.builder()
                                        .street("street")
                                        .zipCode("zipCode")
                                        .city(Optional.of("city"))
                                        .state(Optional.of("state"))
                                        .country(Optional.of("country"))
                                        .buildingId(Optional.of("buildingId"))
                                        .tenantId(Optional.of("tenantId"))
                                        .build()))
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
                                NotificationMethod.of(NotificationMethodZero.builder()
                                        .emailAddress("emailAddress")
                                        .subject("subject")
                                        .type(NotificationMethodZeroType.EMAIL)
                                        .htmlContent(Optional.of("htmlContent"))
                                        .build()),
                                NotificationMethod.of(NotificationMethodZero.builder()
                                        .emailAddress("emailAddress")
                                        .subject("subject")
                                        .type(NotificationMethodZeroType.EMAIL)
                                        .htmlContent(Optional.of("htmlContent"))
                                        .build()))))
                        .optionalMapOfEnums(new HashMap<String, Optional<UserRole>>() {
                            {
                                put("optionalMapOfEnums", Optional.of(UserRole.ADMIN));
                            }
                        })
                        .build());
    }
}
