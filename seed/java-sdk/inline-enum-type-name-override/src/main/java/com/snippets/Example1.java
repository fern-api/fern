package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.reporting.requests.LoadRequest;
import com.seed.api.resources.reporting.types.LoadRequestCache;
import com.seed.api.resources.reporting.types.LoadRequestStatus;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.reporting()
                .load(LoadRequest.builder()
                        .cache(LoadRequestCache.STALE_IF_SLOW)
                        .status(LoadRequestStatus.ACTIVE)
                        .build());
    }
}
