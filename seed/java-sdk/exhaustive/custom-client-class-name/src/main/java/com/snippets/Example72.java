package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpoints.params.requests.GetWithQueryParamsRequest;

public class Example72 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .params()
                .getWithQuery(GetWithQueryParamsRequest.builder()
                        .query("query")
                        .number(1)
                        .build());
    }
}
