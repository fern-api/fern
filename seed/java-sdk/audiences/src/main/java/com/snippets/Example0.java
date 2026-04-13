package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.folderaservice.requests.FolderAServiceGetDirectThreadRequest;
import java.util.Arrays;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.folderAService()
                .folderAServiceGetDirectThread(FolderAServiceGetDirectThreadRequest.builder()
                        .ids(Arrays.asList("ids"))
                        .tags(Arrays.asList("tags"))
                        .build());
    }
}
