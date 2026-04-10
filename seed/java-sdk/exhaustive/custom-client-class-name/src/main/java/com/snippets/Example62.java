package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpointsparams.requests.EndpointsParamsModifyWithInlinePathRequest;

public class Example62 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsParams()
                .endpointsParamsModifyWithInlinePath(EndpointsParamsModifyWithInlinePathRequest.builder()
                        .param("param")
                        .body("string")
                        .build());
    }
}
