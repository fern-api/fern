package example

import (
    client "github.com/imdb/fern/all/the/way/in/here/please/client"
    option "github.com/imdb/fern/all/the/way/in/here/please/option"
    please "github.com/imdb/fern/all/the/way/in/here/please"
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
    request := &please.CreateMovieRequest{
        Title: "title",
        Rating: 1.1,
    }
    client.Imdb.CreateMovie(
        context.TODO(),
        request,
    )
}
