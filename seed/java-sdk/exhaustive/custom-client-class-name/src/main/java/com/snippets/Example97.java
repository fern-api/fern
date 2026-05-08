package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpoints.put.requests.AddPutRequest;

public class Example97 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints().put().add(AddPutRequest.builder().id("id").build());
    }
}
