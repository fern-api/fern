package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpointsparams.requests.EndpointsParamsModifyWithPathRequest;

public class Example59 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsParams()
                .endpointsParamsModifyWithPath(EndpointsParamsModifyWithPathRequest.builder()
                        .param("param")
                        .body("string")
                        .build());
    }
}
