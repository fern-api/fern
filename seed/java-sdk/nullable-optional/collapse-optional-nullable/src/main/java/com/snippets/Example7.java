package com.snippets;

import com.seed.nullableOptional.SeedNullableOptionalClient;
import com.seed.nullableOptional.core.OptionalNullable;
import com.seed.nullableOptional.resources.nullableoptional.requests.UpdateComplexProfileRequest;
import com.seed.nullableOptional.resources.nullableoptional.types.Address;
import com.seed.nullableOptional.resources.nullableoptional.types.EmailNotification;
import com.seed.nullableOptional.resources.nullableoptional.types.NotificationMethod;
import com.seed.nullableOptional.resources.nullableoptional.types.SearchResult;
import com.seed.nullableOptional.resources.nullableoptional.types.UserResponse;
import com.seed.nullableOptional.resources.nullableoptional.types.UserRole;
import com.seed.nullableOptional.resources.nullableoptional.types.UserStatus;
import java.time.OffsetDateTime;
import java.util.Arrays;

public class Example7 {
    public static void main(String[] args) {
        SeedNullableOptionalClient client =
                SeedNullableOptionalClient.builder().url("https://api.fern.com").build();

        client.nullableOptional()
                .updateComplexProfile(
                        "profileId",
                        UpdateComplexProfileRequest.builder()
                                .nullableRole(OptionalNullable.of(UserRole.ADMIN))
                                .nullableStatus(OptionalNullable.of(UserStatus.ACTIVE))
                                .nullableNotification(
                                        OptionalNullable.of(NotificationMethod.email(EmailNotification.builder()
                                                .emailAddress("emailAddress")
                                                .subject("subject")
                                                .htmlContent("htmlContent")
                                                .build())))
                                .nullableSearchResult(OptionalNullable.of(SearchResult.user(UserResponse.builder()
                                        .id("id")
                                        .username("username")
                                        .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                        .email("email")
                                        .phone("phone")
                                        .updatedAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                        .address(Address.builder()
                                                .street("street")
                                                .zipCode("zipCode")
                                                .country(OptionalNullable.of("country"))
                                                .city("city")
                                                .state("state")
                                                .buildingId("buildingId")
                                                .tenantId("tenantId")
                                                .build())
                                        .build())))
                                .nullableArray(OptionalNullable.of(Arrays.asList("nullableArray", "nullableArray")))
                                .build());
    }
}
