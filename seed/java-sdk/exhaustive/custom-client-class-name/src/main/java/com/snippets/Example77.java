package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpoints.params.requests.GetWithInlinePathAndQueryParamsRequest;

public class Example77 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .params()
                .getWithInlinePathAndQuery(GetWithInlinePathAndQueryParamsRequest.builder()
                        .param("param")
                        .query("query")
                        .build());
    }
}
