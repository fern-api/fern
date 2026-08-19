package com.snippets;

import com.seed.unions.SeedUnionsClient;
import com.seed.unions.resources.types.types.UnionWithTime;
import java.time.OffsetDateTime;

public class Example7 {
    public static void main(String[] args) {
        SeedUnionsClient client =
                SeedUnionsClient.builder().url("https://api.fern.com").build();

        client.types().update(UnionWithTime.datetime(OffsetDateTime.parse("1994-01-01T01:01:01Z")));
    }
}
