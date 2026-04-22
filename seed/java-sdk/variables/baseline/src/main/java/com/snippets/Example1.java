package com.snippets;

import com.seed.variables.SeedVariablesClient;

public class Example1 {
    public static void main(String[] args) {
        SeedVariablesClient client = SeedVariablesClient.builder()
                .url("https://api.fern.com")
                .rootVariable("YOUR_ROOT_VARIABLE")
                .build();

        client.service().post();
    }
}
