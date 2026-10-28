package example

import (
    context "context"

    please "github.com/imdb/fern/all/the/way/in/here/please"
    client "github.com/imdb/fern/all/the/way/in/here/please/client"
    option "github.com/imdb/fern/all/the/way/in/here/please/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &please.GetMovieImdbRequest{
        MovieID: "movieId",
    }
    _, err := client.Imdb.GetMovie(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
