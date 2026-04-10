package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.playlist.requests.PlaylistGetPlaylistsRequest;
import java.util.Arrays;
import java.util.Optional;

public class Example26 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.playlist()
                .getplaylists(
                        1,
                        PlaylistGetPlaylistsRequest.builder()
                                .otherField("otherField")
                                .multiLineDocs("multiLineDocs")
                                .optionalMultipleField(Arrays.asList(Optional.of("optionalMultipleField")))
                                .multipleField(Arrays.asList("multipleField"))
                                .limit(1)
                                .build());
    }
}
