package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.testgroup.requests.TestMethodNameTestGroupRequest;
import com.seed.api.types.PlainObject;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.testGroup()
                .testMethodName(
                        "path_param",
                        TestMethodNameTestGroupRequest.builder()
                                .queryParamObject(PlainObject.builder()
                                        .id("id")
                                        .name("name")
                                        .build())
                                .queryParamInteger(1)
                                .body(PlainObject.builder()
                                        .id("id")
                                        .name("name")
                                        .build())
                                .build());
    }
}
