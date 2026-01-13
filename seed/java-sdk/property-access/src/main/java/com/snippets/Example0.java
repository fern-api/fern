package com.snippets;

import com.seed.propertyAccess.SeedPropertyAccessClient;
import com.seed.propertyAccess.types.User;
import com.seed.propertyAccess.types.UserProfile;
import com.seed.propertyAccess.types.UserProfileVerification;

public class Example0 {
    public static void main(String[] args) {
        SeedPropertyAccessClient client =
                SeedPropertyAccessClient.builder().url("https://api.fern.com").build();

        client.createUser(User.builder()
                .id("id")
                .email("email")
                .password("password")
                .profile(UserProfile.builder()
                        .name("name")
                        .verification(UserProfileVerification.builder()
                                .verified("verified")
                                .build())
                        .ssn("ssn")
                        .build())
                .build());
    }
}
