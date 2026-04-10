package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.playlist.requests.PlaylistDeletePlaylistRequest;

public class Example35 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.playlist()
                .deleteplaylist(
                        1,
                        "playlist_id",
                        PlaylistDeletePlaylistRequest.builder().build());
    }
}
