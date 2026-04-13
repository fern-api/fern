package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.core.Nullable;
import com.seed.api.types.Address;
import com.seed.api.types.DeserializationTestRequest;
import com.seed.api.types.NotificationMethod;
import com.seed.api.types.NotificationMethodZero;
import com.seed.api.types.NotificationMethodZeroType;
import com.seed.api.types.UserRole;

public class Example16 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .testdeserialization(DeserializationTestRequest.builder()
                        .requiredString("requiredString")
                        .nullableString(Nullable.ofNull())
                        .nullableEnum(UserRole.ADMIN)
                        .nullableUnion(NotificationMethod.of(NotificationMethodZero.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .type(NotificationMethodZeroType.EMAIL)
                                .build()))
                        .nullableList(Nullable.ofNull())
                        .nullableMap(Nullable.ofNull())
                        .nullableObject(Address.builder()
                                .street("street")
                                .city(Nullable.ofNull())
                                .zipCode("zipCode")
                                .build())
                        .build());
    }
}
