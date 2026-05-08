package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.inlinedrequests.requests.PostWithObjectBodyandResponseInlinedRequestsRequest;
import com.fern.sdk.types.TypesObjectWithOptionalField;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.inlinedRequests().postWithObjectBodyandResponse(
            PostWithObjectBodyandResponseInlinedRequestsRequest
                .builder()
                .string("string")
                .integer(1)
                .nestedObject(
                    TypesObjectWithOptionalField
                        .builder()
                        .build()
                )
                .build()
        );
    }
}