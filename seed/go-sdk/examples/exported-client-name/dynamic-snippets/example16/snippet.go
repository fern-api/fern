package example

import (
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
    fern "github.com/examples/fern"
    context "context"
)

func do() {
    client := client.NewAcmeClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.Movie{
        Id: "id",
        Prequel: fern.String(
            "prequel",
        ),
        Title: "title",
        From: "from",
        Rating: 1.1,
        Tag: "tag",
        Book: fern.String(
            "book",
        ),
        Metadata: map[string]any{
            "metadata": map[string]any{
                "key": "value",
            },
        },
        Revenue: int64(1000000),
    }
    client.Service.CreateMovie(
        context.TODO(),
        request,
    )
}
