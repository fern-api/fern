package com.snippets;

import com.seed.trace.SeedTraceClient;
import com.seed.trace.resources.playlist.types.UpdatePlaylistRequest;
import java.util.Arrays;
import java.util.Optional;

public class Example18 {
    public static void main(String[] args) {
        SeedTraceClient client = SeedTraceClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.playlist()
                .updatePlaylist(
                        1,
                        "playlistId",
                        Optional.of(UpdatePlaylistRequest.builder()
                                .name("name")
                                .problems(Arrays.asList("problems", "problems"))
                                .build()));
    }
}
