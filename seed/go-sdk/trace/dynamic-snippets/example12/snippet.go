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
    request := &fern.CreatePlaylistRequest{
        Datetime: fern.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
        OptionalDatetime: fern.Time(
            fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        ),
        Body: &fern.PlaylistCreateRequest{
            Name: "name",
            Problems: []common.ProblemID{
                "problems",
                "problems",
            },
        },
    }
    _, err := client.Playlist.CreatePlaylist(
        context.TODO(),
        1,
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
