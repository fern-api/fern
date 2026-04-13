package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.User;
import com.seed.api.types.UserProfile;
import com.seed.api.types.UserProfileVerification;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.createUser(User.builder()
                .password("password")
                .profile(UserProfile.builder()
                        .name("name")
                        .verification(UserProfileVerification.builder().build())
                        .ssn("ssn")
                        .build())
                .build());
    }
}
