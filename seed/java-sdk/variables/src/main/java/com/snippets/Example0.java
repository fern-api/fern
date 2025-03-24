package com.snippets;

import com.seed.variables.SeedVariablesClient;

public class Example0 {
    public static void main(String[] args) {
        SeedVariablesClient client = SeedVariablesClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().post("endpointParam");
    }
}