package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.Parent;
import com.seed.api.types.Child;

public class Example9 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service()
                .createparent(Parent.builder()
                        .parentId("parentId")
                        .child(Child.builder().childId("childId").childValue(1).build())
                        .parentName("parentName")
                        .build());
    }
}
