package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpointsparams.requests.EndpointsParamsGetWithPathAndQueryRequest;

public class Example67 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsParams()
                .endpointsParamsGetWithPathAndQuery(EndpointsParamsGetWithPathAndQueryRequest.builder()
                        .param("param")
                        .query("query")
                        .build());
    }
}
