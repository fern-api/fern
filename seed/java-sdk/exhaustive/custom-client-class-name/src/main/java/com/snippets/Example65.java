package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpoints.params.requests.ModifyWithPathParamsRequest;

public class Example65 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .params()
                .modifyWithPath(ModifyWithPathParamsRequest.builder()
                        .param("param")
                        .body("string")
                        .build());
    }
}
