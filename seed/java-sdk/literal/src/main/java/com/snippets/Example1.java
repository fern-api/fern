package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.headers.requests.HeadersSendRequest;
import com.seed.api.resources.headers.types.HeadersSendRequestXEndpointVersion;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.headers()
                .send(HeadersSendRequest.builder()
                        .endpointVersion(HeadersSendRequestXEndpointVersion.TWO122024)
                        .async(true)
                        .query("query")
                        .build());
    }
}
