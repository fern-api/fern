package com.snippets;

import com.seed.api.SeedApiClient;
import java.util.Arrays;

public class Example21 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.homepage().sethomepageproblems(Arrays.asList("string", "string"));
    }
}
