package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.playlist.requests.PlaylistCreatePlaylistRequest;
import com.seed.api.types.PlaylistCreateRequest;
import java.time.OffsetDateTime;
import java.util.Arrays;

public class Example25 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.playlist()
                .createplaylist(
                        1,
                        PlaylistCreatePlaylistRequest.builder()
                                .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .body(PlaylistCreateRequest.builder()
                                        .name("name")
                                        .problems(Arrays.asList("problems", "problems"))
                                        .build())
                                .optionalDatetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .build());
    }
}
