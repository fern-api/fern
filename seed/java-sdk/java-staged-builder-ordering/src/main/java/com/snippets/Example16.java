package com.snippets;

import com.seed.stagedBuilderOrdering.SeedStagedBuilderOrderingClient;
import com.seed.stagedBuilderOrdering.resources.types.types.Child;
import com.seed.stagedBuilderOrdering.resources.types.types.Parent;

public class Example16 {
    public static void main(String[] args) {
        SeedStagedBuilderOrderingClient client = SeedStagedBuilderOrderingClient.builder()
                .url("https://api.fern.com")
                .build();

        client.service()
                .createParent(Parent.builder()
                        .parentId("parentId")
                        .child(Child.builder().childId("childId").childValue(1).build())
                        .parentName("parentName")
                        .build());
    }
}
