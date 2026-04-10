package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.types.types.MixedType;
import java.util.HashMap;

public class Example6 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints().container().getAndReturnMapOfPrimToUndiscriminatedUnion(new HashMap<String, MixedType>() {
            {
                put("string", MixedType.of(1.1));
            }
        });
    }
}
