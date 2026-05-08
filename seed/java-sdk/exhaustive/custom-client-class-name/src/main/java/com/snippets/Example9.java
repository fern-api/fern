package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.reqwithheaders.requests.GetWithCustomHeaderReqWithHeadersRequest;

public class Example9 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.reqWithHeaders()
                .getWithCustomHeader(GetWithCustomHeaderReqWithHeadersRequest.builder()
                        .testEndpointHeader("X-TEST-ENDPOINT-HEADER")
                        .body("string")
                        .build());
    }
}
