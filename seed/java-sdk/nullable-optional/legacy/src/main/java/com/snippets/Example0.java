package com.snippets;

import com.seed.nullableOptional.SeedNullableOptionalClient;

public class Example0 {
    public static void main(String[] args) {
        SeedNullableOptionalClient client =
                SeedNullableOptionalClient.builder().url("https://api.fern.com").build();

        client.nullableOptional().getUser("userId");
    }
}
