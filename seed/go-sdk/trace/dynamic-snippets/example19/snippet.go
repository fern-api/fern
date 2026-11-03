package example

import (
    context "context"

    client "github.com/trace/fern/client"
    option "github.com/trace/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    err := client.Playlist.DeletePlaylist(
        context.TODO(),
        1,
        "playlist_id",
    )
    if err != nil {
        return err
    }
    return nil
}
