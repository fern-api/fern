package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.user.requests.UserCreateUserRequest;
import com.seed.api.resources.user.types.UserCreateUserRequestType;
import com.seed.api.resources.user.types.UserCreateUserRequestVersion;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.user()
                .createuser(UserCreateUserRequest.builder()
                        .type(UserCreateUserRequestType.CREATE_USER_REQUEST)
                        .version(UserCreateUserRequestVersion.V1)
                        .name("name")
                        .build());
    }
}
