package com.snippets;

import com.seed.contentTypes.SeedContentTypesClient;
import com.seed.contentTypes.resources.service.requests.OptionalMergePatchRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedContentTypesClient client =
                SeedContentTypesClient.builder().url("https://api.fern.com").build();

        client.service()
                .optionalMergePatchTest(OptionalMergePatchRequest.builder()
                        .requiredField("requiredField")
                        .nullableString("nullableString")
                        .optionalString("optionalString")
                        .optionalInteger(1)
                        .optionalBoolean(true)
                        .build());
    }
}
