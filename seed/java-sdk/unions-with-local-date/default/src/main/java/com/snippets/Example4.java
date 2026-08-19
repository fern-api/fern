package com.snippets;

import com.seed.unions.SeedUnionsClient;

public class Example4 {
    public static void main(String[] args) {
        SeedUnionsClient client =
                SeedUnionsClient.builder().url("https://api.fern.com").build();

        client.types().get("datetime-example");
    }
}
