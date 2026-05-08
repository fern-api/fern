package com.snippets;

import com.seed.api.Best;
import java.util.HashMap;

public class Example57 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints().object().getAndReturnMapOfDocumentedUnknownType(new HashMap<String, Object>());
    }
}
