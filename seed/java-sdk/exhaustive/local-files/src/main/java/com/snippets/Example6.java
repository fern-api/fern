package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.types.union.types.MixedType;
import java.util.HashMap;

public class Example6 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().container().getAndReturnMapOfPrimToUndiscriminatedUnion(
            new HashMap<String, MixedType>() {{
                put("string", MixedType.of(1.1));
            }}
        );
    }
}