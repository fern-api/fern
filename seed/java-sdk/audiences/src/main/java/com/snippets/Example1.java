package com.snippets;

import com.seed.audiences.SeedAudiencesClient;

public class Example1 {
    public static void run() {
        SeedAudiencesClient client = SeedAudiencesClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.folderD().service().getDirectThread();
    }
}