package com.snippets;

import com.seed.clientSideParams.SeedClientSideParamsClient;

public class Example7 {
    public static void main(String[] args) {
        SeedClientSideParamsClient client = SeedClientSideParamsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().deleteUser("userId");
    }
}