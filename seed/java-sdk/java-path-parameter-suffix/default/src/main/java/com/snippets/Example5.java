package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.FetchAccountRequest;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.fetchAccount("accountSid", FetchAccountRequest.builder().build());
    }
}
