package com.snippets;

import com.seed.endpointSecurityAuth.SeedEndpointSecurityAuthClient;

public class Example3 {
    public static void main(String[] args) {
        SeedEndpointSecurityAuthClient client = SeedEndpointSecurityAuthClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.user().getWithBearer();
    }
}