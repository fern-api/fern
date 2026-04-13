package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.nullableoptional.requests.NullableOptionalUpdateComplexProfileRequest;
import com.seed.api.types.Address;
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
import java.util.Optional;

public class Example15 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .updatecomplexprofile(
                        "profileId",
                        NullableOptionalUpdateComplexProfileRequest.builder()
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
                                .nullableArray(Optional.of(Arrays.asList("nullableArray", "nullableArray")))
                                .build());
    }
}
