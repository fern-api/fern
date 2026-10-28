package example

import (
    context "context"

    fern "github.com/trace/fern"
    client "github.com/trace/fern/client"
    common "github.com/trace/fern/common"
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
    request := &fern.UpdatePlaylistRequest{
        Name: "name",
        Problems: []common.ProblemID{
            "problems",
            "problems",
        },
    }
    _, err := client.Playlist.UpdatePlaylist(
        context.TODO(),
        1,
        "playlistId",
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
