package example

import (
    context "context"

    fern "github.com/trace/fern"
    client "github.com/trace/fern/client"
    common "github.com/trace/fern/common"
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
    request := &fern.UpdatePlaylistRequest{
        Name: "name",
        Problems: []common.ProblemID{
            "problems",
            "problems",
        },
    }
    client.Playlist.UpdatePlaylist(
        context.TODO(),
        1,
        "playlistId",
        request,
    )
}
