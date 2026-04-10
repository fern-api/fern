package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.playlist.requests.UpdatePlaylistRequest;
import java.util.Arrays;

public class Example31 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.playlist()
                .updateplaylist(
                        1,
                        "playlistId",
                        UpdatePlaylistRequest.builder()
                                .name("name")
                                .problems(Arrays.asList("problems"))
                                .build());
    }
}
