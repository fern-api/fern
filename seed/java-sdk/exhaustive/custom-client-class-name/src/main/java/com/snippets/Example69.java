package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpoints.params.requests.ModifyWithInlinePathParamsRequest;

public class Example69 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .params()
                .modifyWithInlinePath(ModifyWithInlinePathParamsRequest.builder()
                        .param("param")
                        .body("string")
                        .build());
    }
}
