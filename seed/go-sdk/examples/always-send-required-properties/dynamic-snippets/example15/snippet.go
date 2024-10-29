package example

import (
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
    context "context"
    fern "github.com/examples/fern"
)

func do() () {
    client := client.NewClient(
        option.WithToken(
            "<token>",
        ),
    )
    client.Service.CreateMovie(
        context.TODO(),
        &fern.Movie{
            Id: "id",
            Title: "title",
            From: "from",
            Rating: 1.1,
            Tag: "tag",
            Metadata: map[string]interface{}{
                "metadata": map[string]interface{}{
                    "key": "value",
                },
            },
            Revenue: 1000000,
        },
    )}
