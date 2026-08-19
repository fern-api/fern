package com.snippets;

import com.seed.deepCursorPath.SeedDeepCursorPathClient;
import com.seed.deepCursorPath.resources.deepcursorpath.types.InlineA;
import com.seed.deepCursorPath.resources.deepcursorpath.types.InlineB;
import com.seed.deepCursorPath.resources.deepcursorpath.types.InlineC;
import com.seed.deepCursorPath.resources.deepcursorpath.types.InlineD;

public class Example2 {
    public static void main(String[] args) {
        SeedDeepCursorPathClient client =
                SeedDeepCursorPathClient.builder().url("https://api.fern.com").build();

        client.deepCursorPath()
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
