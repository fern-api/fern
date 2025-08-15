package com.snippets;

import com.seed.clientSideParams.SeedClientSideParamsClient;
import com.seed.clientSideParams.resources.types.types.UpdateUserRequest;
import java.util.HashMap;

public class Example6 {
    public static void main(String[] args) {
        SeedClientSideParamsClient client = SeedClientSideParamsClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().updateUser(
            "userId",
            UpdateUserRequest
                .builder()
                .email("email")
                .emailVerified(true)
                .username("username")
                .phoneNumber("phone_number")
                .phoneVerified(true)
                .userMetadata(
                    new HashMap<String, Object>() {{
                        put("user_metadata", new 
                        HashMap<String, Object>() {{put("key", "value");
                        }});
                    }}
                )
                .appMetadata(
                    new HashMap<String, Object>() {{
                        put("app_metadata", new 
                        HashMap<String, Object>() {{put("key", "value");
                        }});
                    }}
                )
                .password("password")
                .blocked(true)
                .build()
        );
    }
}