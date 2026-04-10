package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.reqwithheaders.requests.ReqWithHeadersGetWithCustomHeaderRequest;

public class Example115 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.reqwithheaders()
                .getwithcustomheader(ReqWithHeadersGetWithCustomHeaderRequest.builder()
                        .testEndpointHeader("X-TEST-ENDPOINT-HEADER")
                        .body("string")
                        .build());
    }
}
