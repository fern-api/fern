package com.snippets;

import com.seed.aliasExtends.SeedAliasExtendsClient;
import com.seed.aliasExtends.requests.InlinedChildRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedAliasExtendsClient client =
                SeedAliasExtendsClient.builder().url("https://api.fern.com").build();

        client.extendedInlineRequestBody(
                InlinedChildRequest.builder().parent("parent").child("child").build());
    }
}
