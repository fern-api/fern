package example

import (
    client "github.com/imdb/fern/client"
    option "github.com/imdb/fern/option"
    context "context"
    fern "github.com/imdb/fern"
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
        &fern.CreateMovieRequest{
            Title: "title",
            Rating: 1.1,
        },
    )
}
