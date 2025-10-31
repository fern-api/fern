package com.snippets;

import com.seed.audiences.SeedAudiencesClient;
import com.seed.audiences.resources.foldera.service.requests.GetDirectThreadRequest;
import java.util.Arrays;

public class Example0 {
    public static void main(String[] args) {
        SeedAudiencesClient client =
                SeedAudiencesClient.builder().url("https://api.fern.com").build();

        client.folderA()
                .service()
                .getDirectThread(GetDirectThreadRequest.builder()
                        .ids(Arrays.asList("ids"))
                        .tags(Arrays.asList("tags"))
                        .build());
    }
}
