package com.snippets;

import com.seed.stagedBuilderOrdering.SeedStagedBuilderOrderingClient;
import com.seed.stagedBuilderOrdering.resources.types.types.MediumStaged;

public class Example5 {
    public static void main(String[] args) {
        SeedStagedBuilderOrderingClient client = SeedStagedBuilderOrderingClient.builder()
                .url("https://api.fern.com")
                .build();

        client.service()
                .createMedium(MediumStaged.builder()
                        .alpha("alpha")
                        .beta(1)
                        .gamma("gamma")
                        .delta(true)
                        .optional("optional")
                        .build());
    }
}
