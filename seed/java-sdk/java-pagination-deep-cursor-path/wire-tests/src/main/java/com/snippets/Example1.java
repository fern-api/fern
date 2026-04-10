package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.deepcursorpath.requests.A;
import com.seed.api.types.B;
import com.seed.api.types.C;
import com.seed.api.types.D;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.deepcursorpath()
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
