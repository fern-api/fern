package example

import (
    context "context"

    fern "github.com/trace/fern"
    client "github.com/trace/fern/client"
    option "github.com/trace/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.PlaylistGetPlaylistRequest{
        ServiceParam: 1,
        PlaylistID: "playlistId",
    }
    client.Playlist.Getplaylist(
        context.TODO(),
        request,
    )
}
