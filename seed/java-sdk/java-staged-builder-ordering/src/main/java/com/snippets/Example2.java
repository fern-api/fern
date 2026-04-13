package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.MediumStaged;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service()
                .createmedium(MediumStaged.builder()
                        .alpha("alpha")
                        .beta(1)
                        .gamma("gamma")
                        .delta(true)
                        .build());
    }
}
