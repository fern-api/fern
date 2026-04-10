package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.reference.requests.SendRequest;
import com.seed.api.resources.reference.types.SendRequestEnding;
import com.seed.api.resources.reference.types.SendRequestPrompt;
import com.seed.api.types.ContainerObject;
import com.seed.api.types.NestedObjectWithLiterals;
import com.seed.api.types.NestedObjectWithLiteralsLiteral1;
import com.seed.api.types.NestedObjectWithLiteralsLiteral2;
import com.seed.api.types.SomeLiteral;
import java.util.Arrays;

public class Example8 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.reference()
                .send(SendRequest.builder().prompt(SendRequestPrompt.YOU_ARE_A_HELPFUL_ASSISTANT).query("query").stream(
                                true)
                        .ending(SendRequestEnding.ENDING)
                        .context(SomeLiteral.YOURE_SUPER_WISE)
                        .containerObject(ContainerObject.builder()
                                .nestedObjects(Arrays.asList(NestedObjectWithLiterals.builder()
                                        .literal1(NestedObjectWithLiteralsLiteral1.LITERAL1)
                                        .literal2(NestedObjectWithLiteralsLiteral2.LITERAL2)
                                        .strProp("strProp")
                                        .build()))
                                .build())
                        .build());
    }
}
