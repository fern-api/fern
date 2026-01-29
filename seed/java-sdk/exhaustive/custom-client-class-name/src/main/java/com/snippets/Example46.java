package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.inlinedrequests.requests.RequiredAndOptionalRequest;

public class Example46 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.inlinedRequests()
                .postWithRequiredAndOptionalFields(RequiredAndOptionalRequest.builder()
                        .optionalString("optional_value")
                        .build());
    }
}
