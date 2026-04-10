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
    request := &fern.PlaylistCreatePlaylistRequest{
        ServiceParam: 1,
        Datetime: fern.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
        Body: &fern.PlaylistCreateRequest{
            Name: "name",
            Problems: []fern.ProblemID{
                "problems",
            },
        },
    }
    client.Playlist.Createplaylist(
        context.TODO(),
        request,
    )
}
