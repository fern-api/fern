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
    request := &fern.PlaylistDeletePlaylistRequest{
        ServiceParam: 1,
        PlaylistID: "playlist_id",
    }
    client.Playlist.Deleteplaylist(
        context.TODO(),
        request,
    )
}
