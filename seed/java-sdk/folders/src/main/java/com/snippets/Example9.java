package com.snippets;

import com.seed.api.SeedApiClient;
import java.util.HashMap;

public class Example9 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.folderService().folderServiceUnknownRequest(new HashMap<String, Object>() {
            {
                put("key", "value");
            }
        });
    }
}
