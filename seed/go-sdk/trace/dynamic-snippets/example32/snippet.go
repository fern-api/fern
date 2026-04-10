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
    request := &fern.UpdatePlaylistRequest{
        ServiceParam: 1,
        PlaylistID: "playlistId",
        Name: "name",
        Problems: []fern.ProblemID{
            "problems",
            "problems",
        },
    }
    client.Playlist.Updateplaylist(
        context.TODO(),
        request,
    )
}
