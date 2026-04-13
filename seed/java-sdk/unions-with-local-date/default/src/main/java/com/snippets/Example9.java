package com.snippets;

import com.seed.unions.SeedApiClient;
import com.seed.unions.types.UnionWithTime;
import com.seed.unions.types.UnionWithTimeValue;

public class Example9 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.types()
                .update(UnionWithTime.value(
                        UnionWithTimeValue.builder().value(1).build()));
    }
}
