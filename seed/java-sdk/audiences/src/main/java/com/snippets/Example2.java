package com.snippets;

import com.seed.audiences.SeedAudiencesClient;
import com.seed.audiences.resources.foo.requests.FindRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedAudiencesClient client = SeedAudiencesClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.foo().find(
            FindRequest
                .builder()
                .optionalString("optionalString")
                .publicProperty("publicProperty")
                .privateProperty(1)
                .build()
        );
    }
}