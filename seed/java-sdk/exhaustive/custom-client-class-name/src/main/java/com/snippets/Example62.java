package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.inlinedrequests.requests.PostWithArrayBodyAndHeaders;
import java.util.Arrays;

public class Example62 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.inlinedRequests()
                .postWithArrayBodyAndHeaders(PostWithArrayBodyAndHeaders.builder()
                        .body(Arrays.asList("string", "string"))
                        .xCustomHeader("X-Custom-Header")
                        .build());
    }
}
