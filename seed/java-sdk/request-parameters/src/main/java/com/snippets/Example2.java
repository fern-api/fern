package com.snippets;

import com.seed.requestParameters.SeedRequestParametersClient;
import java.util.Optional;

public class Example2 {
    public static void main(String[] args) {
        SeedRequestParametersClient client = SeedRequestParametersClient.builder()
                .url("https://api.fern.com")
                .build();

        client.user().createUsernameOptional(Optional.empty());
    }
}
