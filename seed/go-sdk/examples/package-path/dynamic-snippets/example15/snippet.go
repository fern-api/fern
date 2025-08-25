package example

import (
    client "github.com/examples/fern/pleaseinhere/client"
    option "github.com/examples/fern/pleaseinhere/option"
    context "context"
    pleaseinhere "github.com/examples/fern/pleaseinhere"
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
    client.Service.CreateMovie(
        context.TODO(),
        &pleaseinhere.Movie{
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
            Revenue: 1000000,
        },
    )
}
