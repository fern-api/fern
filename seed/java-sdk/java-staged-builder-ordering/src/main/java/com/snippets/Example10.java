package com.snippets;

import com.seed.stagedBuilderOrdering.SeedStagedBuilderOrderingClient;
import com.seed.stagedBuilderOrdering.resources.types.types.ComplexStaged;

public class Example10 {
    public static void main(String[] args) {
        SeedStagedBuilderOrderingClient client = SeedStagedBuilderOrderingClient.builder()
                .url("https://api.fern.com")
                .build();

        client.service()
                .createComplex(ComplexStaged.builder()
                        .fieldA("fieldA")
                        .fieldB(1)
                        .fieldC(true)
                        .fieldD("fieldD")
                        .fieldE(1.1)
                        .optionalX("optionalX")
                        .optionalY(1)
                        .optionalZ(true)
                        .build());
    }
}
