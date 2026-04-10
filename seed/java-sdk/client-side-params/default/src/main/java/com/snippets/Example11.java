package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceGetUserByIdRequest;

public class Example11 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service()
                .getuserbyid(
                        "userId",
                        ServiceGetUserByIdRequest.builder()
                                .fields("fields")
                                .includeFields(true)
                                .build());
    }
}
