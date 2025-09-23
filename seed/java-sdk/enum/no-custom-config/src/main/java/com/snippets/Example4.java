package com.snippets;

import com.seed.enum.SeedEnumClient;
import com.seed.enum.types.Operand;

public class Example4 {
    public static void main(String[] args) {
        SeedEnumClient client = SeedEnumClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.pathParam().send(Operand.GREATER_THAN, red);
    }
}