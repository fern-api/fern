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
    request := &fern.PlaylistGetPlaylistsRequest{
        ServiceParam: 1,
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
        MultipleField: []*string{
            fern.String(
                "multipleField",
            ),
        },
    }
    client.Playlist.Getplaylists(
        context.TODO(),
        request,
    )
}
