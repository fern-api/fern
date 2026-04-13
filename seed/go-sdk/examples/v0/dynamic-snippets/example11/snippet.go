package example

import (
    context "context"

    fern "github.com/examples/fern"
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
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
    request := &fern.Movie{
        ID: "id",
        Title: "title",
        From: "from",
        Rating: 1.1,
        Type: fern.MovieTypeMovie,
        Tag: "tag",
        Metadata: map[string]any{
            "key": "value",
        },
        Revenue: int64(1000000),
    }
    client.Service.Createmovie(
        context.TODO(),
        request,
    )
}
