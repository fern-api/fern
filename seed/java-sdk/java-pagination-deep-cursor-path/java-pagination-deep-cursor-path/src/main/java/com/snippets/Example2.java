package com.snippets;

import com.seed.deep.cursor.path.SeedDeepCursorPathClient;
import com.seed.deep.cursor.path.resources.deepcursorpath.types.InlineA;
import com.seed.deep.cursor.path.resources.deepcursorpath.types.InlineB;
import com.seed.deep.cursor.path.resources.deepcursorpath.types.InlineC;
import com.seed.deep.cursor.path.resources.deepcursorpath.types.InlineD;

public class Example2 {
    public static void run() {
        SeedDeepCursorPathClient client = SeedDeepCursorPathClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.deepCursorPath().doThingInline(
            InlineA
                .builder()
                .b(
                    InlineB
                        .builder()
                        .c(
                            InlineC
                                .builder()
                                .b(
                                    InlineD
                                        .builder()
                                        .startingAfter("starting_after")
                                        .build()
                                )
                                .build()
                        )
                        .build()
                )
                .build()
        );
    }
}