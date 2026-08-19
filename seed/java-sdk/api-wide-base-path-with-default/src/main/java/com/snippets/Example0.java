package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.Widget;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .url("https://api.fern.com")
                .apiVersion("v1beta")
                .build();

        client.widgets().create(Widget.builder().name("name").build());
    }
}
