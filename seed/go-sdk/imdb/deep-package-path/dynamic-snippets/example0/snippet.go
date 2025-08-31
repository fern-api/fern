package example

import (
    client "github.com/imdb/fern/all/the/way/in/here/please/client"
    option "github.com/imdb/fern/all/the/way/in/here/please/option"
    context "context"
    please "github.com/imdb/fern/all/the/way/in/here/please"
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
        &please.CreateMovieRequest{
            Title: "title",
            Rating: 1.1,
        },
    )
}
