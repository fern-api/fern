package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpointsparams.requests.EndpointsParamsGetWithInlinePathRequest;

public class Example61 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsParams()
                .endpointsParamsGetWithInlinePath(EndpointsParamsGetWithInlinePathRequest.builder()
                        .param("param")
                        .build());
    }
}
