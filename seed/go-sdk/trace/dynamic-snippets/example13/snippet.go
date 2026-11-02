package example

import (
    context "context"

    fern "github.com/trace/fern"
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
    request := &fern.GetPlaylistsRequest{
        Limit: fern.Int(
            1,
        ),
        OtherField: "otherField",
        MultiLineDocs: "multiLineDocs",
        OptionalMultipleField: []*string{
            fern.String(
                "optionalMultipleField",
            ),
        },
        MultipleField: []string{
            "multipleField",
        },
    }
    _, err := client.Playlist.GetPlaylists(
        context.TODO(),
        1,
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
