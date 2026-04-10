package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceOptionalMergePatchTestRequest;

public class Example6 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service()
                .optionalmergepatchtest(ServiceOptionalMergePatchTestRequest.builder()
                        .requiredField("requiredField")
                        .build());
    }
}
