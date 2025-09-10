package com.snippets;

import com.seed.trace.SeedTraceClient;
import com.seed.trace.resources.playlist.requests.CreatePlaylistRequest;
import com.seed.trace.resources.playlist.types.PlaylistCreateRequest;
import java.time.OffsetDateTime;
import java.util.Arrays;

public class Example12 {
    public static void main(String[] args) {
        SeedTraceClient client = SeedTraceClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.playlist().createPlaylist(
            1,
            CreatePlaylistRequest
                .builder()
                .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .body(
                    PlaylistCreateRequest
                        .builder()
                        .name("name")
                        .problems(
                            Arrays.asList("problems", "problems")
                        )
                        .build()
                )
                .optionalDatetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .build()
        );
    }
}