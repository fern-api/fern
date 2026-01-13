package com.snippets;

import com.seed.stagedBuilderOrdering.SeedStagedBuilderOrderingClient;
import com.seed.stagedBuilderOrdering.resources.types.types.ComplexStaged;

public class Example8 {
    public static void main(String[] args) {
        SeedStagedBuilderOrderingClient client = SeedStagedBuilderOrderingClient.builder()
                .url("https://api.fern.com")
                .build();

        client.service()
                .createComplex(ComplexStaged.builder()
                        .fieldA("a")
                        .fieldB(1)
                        .fieldC(true)
                        .fieldD("d")
                        .fieldE(1.5)
                        .optionalX("x")
                        .optionalY(2)
                        .optionalZ(false)
                        .build());
    }
}
