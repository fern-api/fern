package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.nullableoptional.requests.NullableOptionalGetNotificationSettingsRequest;

public class Example20 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .getnotificationsettings(
                        "userId",
                        NullableOptionalGetNotificationSettingsRequest.builder().build());
    }
}
