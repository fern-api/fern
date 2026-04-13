package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceOptionalMergePatchTestRequest;

public class Example7 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service()
                .optionalmergepatchtest(ServiceOptionalMergePatchTestRequest.builder()
                        .requiredField("requiredField")
                        .nullableString("nullableString")
                        .optionalString("optionalString")
                        .optionalInteger(1)
                        .optionalBoolean(true)
                        .build());
    }
}
