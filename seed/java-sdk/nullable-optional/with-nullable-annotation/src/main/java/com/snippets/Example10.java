package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.core.Nullable;
import com.seed.api.types.ComplexProfile;
import com.seed.api.types.NotificationMethod;
import com.seed.api.types.NotificationMethodZero;
import com.seed.api.types.NotificationMethodZeroType;
import com.seed.api.types.UserRole;
import com.seed.api.types.UserStatus;

public class Example10 {
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
                                .build()))
                        .nullableArray(Nullable.ofNull())
                        .nullableListOfNullables(Nullable.ofNull())
                        .nullableMapOfNullables(Nullable.ofNull())
                        .nullableListOfUnions(Nullable.ofNull())
                        .build());
    }
}
