package com.snippets;

import com.seed.audiences.SeedAudiencesClient;

public class Example1 {
    public static void main(String[] args) {
        SeedAudiencesClient client =
                SeedAudiencesClient.builder().url("https://api.fern.com").build();

        client.folderD().service().getDirectThread();
    }
}
