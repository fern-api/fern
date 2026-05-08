package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpoints.params.requests.GetWithInlinePathParamsRequest;

public class Example67 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .params()
                .getWithInlinePath(
                        GetWithInlinePathParamsRequest.builder().param("param").build());
    }
}
