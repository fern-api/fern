package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.AstNode;
import com.seed.api.types.AstNodeLlm;
import java.util.HashMap;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.createAst(AstNode.llm(AstNodeLlm.builder()
                .model("model")
                .valueSchema(new HashMap<String, Object>() {
                    {
                        put("value_schema", new HashMap<String, Object>() {
                            {
                                put("key", "value");
                            }
                        });
                    }
                })
                .prompt("prompt")
                .build()));
    }
}
