package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.path.requests.PathSendRequest;
import com.seed.api.resources.path.types.PathSendRequestId;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.path()
                .send(
                        PathSendRequestId.ONE_HUNDRED_TWENTY_THREE,
                        PathSendRequest.builder().build());
    }
}
