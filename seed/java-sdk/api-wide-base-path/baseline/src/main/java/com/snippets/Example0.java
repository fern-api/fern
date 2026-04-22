package com.snippets;

import com.seed.apiWideBasePath.SeedApiWideBasePathClient;

public class Example0 {
    public static void main(String[] args) {
        SeedApiWideBasePathClient client = SeedApiWideBasePathClient.builder()
                .url("https://api.fern.com")
                .pathParam("pathParam")
                .build();

        client.service().post("serviceParam", 1, "resourceParam");
    }
}
