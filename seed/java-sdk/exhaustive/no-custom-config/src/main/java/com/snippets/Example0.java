package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.inlinedrequests.requests.PostwithobjectbodyandresponseInlinedrequestsRequest;
import com.seed.api.types.TypesObjectWithOptionalField;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.inlinedrequests()
                .postwithobjectbodyandresponse(PostwithobjectbodyandresponseInlinedrequestsRequest.builder()
                        .string("string")
                        .integer(1)
                        .nestedObject(TypesObjectWithOptionalField.builder().build())
                        .build());
    }
}
