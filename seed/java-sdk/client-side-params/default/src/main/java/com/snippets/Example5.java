package com.snippets;

import com.seed.clientSideParams.SeedClientSideParamsClient;
import com.seed.clientSideParams.resources.types.types.CreateUserRequest;
import java.util.HashMap;

public class Example5 {
    public static void main(String[] args) {
        SeedClientSideParamsClient client = SeedClientSideParamsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().createUser(
            CreateUserRequest
                .builder()
                .email("email")
                .connection("connection")
                .emailVerified(true)
                .username("username")
                .password("password")
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
                .build()
        );
    }
}