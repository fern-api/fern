package example

import (
    fern "github.com/imdb/fern"
    option "github.com/imdb/fern/option"
    context "context"
)

func do() {
    client := fern.NewClient(
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
