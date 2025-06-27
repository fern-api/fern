package example

import (
    client "github.com/go-content-type/fern/client"
    option "github.com/go-content-type/fern/option"
    context "context"
    fern "github.com/go-content-type/fern"
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
