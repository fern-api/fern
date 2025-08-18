package example

import (
    client "github.com/imdb/fern/inhereplease/client"
    option "github.com/imdb/fern/inhereplease/option"
    context "context"
    inhereplease "github.com/imdb/fern/inhereplease"
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
    client.Imdb.CreateMovie(
        context.TODO(),
        &inhereplease.CreateMovieRequest{
            Title: "title",
            Rating: 1.1,
        },
    )
}
