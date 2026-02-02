package example

import (
    client "github.com/examples/fern/pleaseinhere/client"
    option "github.com/examples/fern/pleaseinhere/option"
    pleaseinhere "github.com/examples/fern/pleaseinhere"
    context "context"
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
    request := &pleaseinhere.Movie{
        Id: "id",
        Prequel: pleaseinhere.String(
            "prequel",
        ),
        Title: "title",
        From: "from",
        Rating: 1.1,
        Tag: "tag",
        Book: pleaseinhere.String(
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
