package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpointsparams.requests.EndpointsParamsGetWithInlinePathAndQueryRequest;

public class Example70 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsParams()
                .endpointsParamsGetWithInlinePathAndQuery(EndpointsParamsGetWithInlinePathAndQueryRequest.builder()
                        .param("param")
                        .query("query")
                        .build());
    }
}
