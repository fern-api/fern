package com.snippets;

import com.seed.deep.cursor.path.SeedDeepCursorPathClient;
import com.seed.deep.cursor.path.resources.deepcursorpath.types.A;
import com.seed.deep.cursor.path.resources.deepcursorpath.types.B;
import com.seed.deep.cursor.path.resources.deepcursorpath.types.C;
import com.seed.deep.cursor.path.resources.deepcursorpath.types.D;

public class Example0 {
    public static void run() {
        SeedDeepCursorPathClient client = SeedDeepCursorPathClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.deepCursorPath().doThing(
            A
                .builder()
                .b(
                    B
                        .builder()
                        .c(
                            C
                                .builder()
                                .d(
                                    D
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