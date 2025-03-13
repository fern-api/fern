package com.snippets;

import com.seed.audiences.SeedAudiencesClient;

public class Example0 {
    public static void run() {
        SeedAudiencesClient client = SeedAudiencesClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.folderA().service().getDirectThread();
    }
}