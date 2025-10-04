package com.snippets;

import com.seed.deepCursorPath.SeedDeepCursorPathClient;
import com.seed.deepCursorPath.resources.deepcursorpath.types.A;
import com.seed.deepCursorPath.resources.deepcursorpath.types.B;
import com.seed.deepCursorPath.resources.deepcursorpath.types.C;
import com.seed.deepCursorPath.resources.deepcursorpath.types.D;

public class Example0 {
    public static void main(String[] args) {
        SeedDeepCursorPathClient client =
                SeedDeepCursorPathClient.builder().url("https://api.fern.com").build();

        client.deepCursorPath()
                .doThing(A.builder()
                        .b(B.builder()
                                .c(C.builder()
                                        .d(D.builder()
                                                .startingAfter("starting_after")
                                                .build())
                                        .build())
                                .build())
                        .build());
    }
}
