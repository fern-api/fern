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
    _, err := client.Playlist.GetPlaylist(
        context.TODO(),
        1,
        "playlistId",
    )
    if err != nil {
        return err
    }
    return nil
}
