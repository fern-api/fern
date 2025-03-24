package com.snippets;

import com.seed.trace.SeedTraceClient;
import com.seed.trace.resources.playlist.requests.GetPlaylistsRequest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;

public class Example13 {
    public static void main(String[] args) {
        SeedTraceClient client = SeedTraceClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.playlist().getPlaylists(
            1,
            GetPlaylistsRequest
                .builder()
                .otherField("otherField")
                .multiLineDocs("multiLineDocs")
                .optionalMultipleField(
                    new ArrayList<Optional<String>>(
                        Arrays.asList("optionalMultipleField")
                    )
                )
                .multipleField(
                    new ArrayList<String>(
                        Arrays.asList("multipleField")
                    )
                )
                .limit(1)
                .build()
        );
    }
}