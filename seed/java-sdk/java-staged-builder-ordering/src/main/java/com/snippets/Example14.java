package com.snippets;

import com.seed.stagedBuilderOrdering.SeedStagedBuilderOrderingClient;
import com.seed.stagedBuilderOrdering.resources.types.types.Child;
import com.seed.stagedBuilderOrdering.resources.types.types.Parent;

public class Example14 {
    public static void main(String[] args) {
        SeedStagedBuilderOrderingClient client = SeedStagedBuilderOrderingClient.builder()
                .url("https://api.fern.com")
                .build();

        client.service()
                .createParent(Parent.builder()
                        .parentId("parent-123")
                        .child(Child.builder()
                                .childId("child-456")
                                .childValue(789)
                                .build())
                        .parentName("Parent Name")
                        .build());
    }
}
