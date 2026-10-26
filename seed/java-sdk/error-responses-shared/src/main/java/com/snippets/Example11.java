package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.messages.types.Message;

public class Example11 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.messages()
                .messages()
                .createMessage(Message.builder().sid("sid").body("body").build());
    }
}
