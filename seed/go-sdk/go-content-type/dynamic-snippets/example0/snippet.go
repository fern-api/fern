package example

import (
    client "github.com/go-content-type/fern/client"
    option "github.com/go-content-type/fern/option"
    fern "github.com/go-content-type/fern"
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
    request := &fern.CreateMovieRequest{
        Title: "title",
        Rating: 1.1,
    }
    client.Imdb.CreateMovie(
        context.TODO(),
        request,
    )
}
