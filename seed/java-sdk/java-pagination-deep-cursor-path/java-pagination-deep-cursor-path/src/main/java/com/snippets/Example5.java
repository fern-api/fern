package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.deepcursorpath.requests.InlineA;
import com.seed.api.types.InlineB;
import com.seed.api.types.InlineC;
import com.seed.api.types.InlineD;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.deepcursorpath()
                .doThingInline(InlineA.builder()
                        .b(InlineB.builder()
                                .c(InlineC.builder()
                                        .b(InlineD.builder()
                                                .startingAfter("starting_after")
                                                .build())
                                        .build())
                                .build())
                        .build());
    }
}
