package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.UpdateUserRequest;
import java.util.HashMap;

public class Example15 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service()
                .updateuser(
                        "userId",
                        UpdateUserRequest.builder()
                                .email("email")
                                .emailVerified(true)
                                .username("username")
                                .phoneNumber("phone_number")
                                .phoneVerified(true)
                                .userMetadata(new HashMap<String, Object>() {
                                    {
                                        put("user_metadata", new HashMap<String, Object>() {
                                            {
                                                put("key", "value");
                                            }
                                        });
                                    }
                                })
                                .appMetadata(new HashMap<String, Object>() {
                                    {
                                        put("app_metadata", new HashMap<String, Object>() {
                                            {
                                                put("key", "value");
                                            }
                                        });
                                    }
                                })
                                .password("password")
                                .blocked(true)
                                .build());
    }
}
