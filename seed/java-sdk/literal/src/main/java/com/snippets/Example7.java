package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.query.requests.QuerySendRequest;
import com.seed.api.resources.query.types.QuerySendRequestOptionalPrompt;
import com.seed.api.resources.query.types.QuerySendRequestPrompt;
import com.seed.api.types.AliasToPrompt;

public class Example7 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.query()
                .send(QuerySendRequest.builder()
                        .prompt(QuerySendRequestPrompt.YOU_ARE_A_HELPFUL_ASSISTANT)
                        .aliasPrompt(AliasToPrompt.YOU_ARE_A_HELPFUL_ASSISTANT)
                        .query("query")
                        .stream(true)
                        .aliasStream(true)
                        .optionalPrompt(QuerySendRequestOptionalPrompt.YOU_ARE_A_HELPFUL_ASSISTANT)
                        .aliasOptionalPrompt(AliasToPrompt.YOU_ARE_A_HELPFUL_ASSISTANT)
                        .optionalStream(true)
                        .aliasOptionalStream(true)
                        .build());
    }
}
