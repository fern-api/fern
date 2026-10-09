package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.AstNode;
import com.seed.api.types.AstNodeLlm;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.createAst(AstNode.llm(AstNodeLlm.builder().model("model").build()));
    }
}
